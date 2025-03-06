"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, Card, Form, Input, message } from "antd";

const AuthForm: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { set: setToken } = useLocalStorage<string>("token", "");

  const [messageApi, contextHolder] = message.useMessage();

  interface LoginFormValues {
    username: string;
    password: string;
  }
  
  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const formattedValues = {
        username: values.username,
        password: values.password,
      };

      const endpoint = isLoginMode ? "/login" : "/register";

      interface AuthResponse {
        token: string;
        id: string;
      }
      

      const response = await apiService.post<AuthResponse>(endpoint, formattedValues);

      if (response.token) {
        setToken(response.token);
        localStorage.setItem("token", response.token);
        localStorage.setItem("userId", response.id);
        router.push("/users");
      }
      if (!isLoginMode) {
        interface LoginResponse {
          token: string;
          id: string;
        }


        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const loginResponse = await apiService.post<LoginResponse>("/login", formattedValues);
        
        if (loginResponse.token) {
          setToken(loginResponse.token);
          localStorage.setItem("token", loginResponse.token);
          localStorage.setItem("userId", loginResponse.id);
          router.push("/users");
        }
      } else {
        if (response.token) {
          setToken(response.token);
          localStorage.setItem("token", response.token);
          localStorage.setItem("userId", response.id);
          router.push("/users");
        }
      }
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("🚨 Login Error:", error);
      }
  
      let errorMessage = "Something went wrong.";
  
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
  
      messageApi.open({
        type: "error",
        content: <span style={{ color: "black" }}>{errorMessage}</span>,
      });
    }
  };

  return (
    <div className="auth-container">
      {contextHolder}
      <Card title={isLoginMode ? "Login" : "Register"} className="auth-card">
        <Form
          form={form}
          name="authForm"
          size="large"
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Enter Username" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="auth-button">
              {isLoginMode ? "Login" : "Register"}
            </Button>
          </Form.Item>
        </Form>

        <Button 
          type="link" 
          onClick={() => setIsLoginMode(!isLoginMode)}
          className="auth-link"
        >
          {isLoginMode ? "Don't have an account? Register" : "Already have an account? Login"}
        </Button>
      </Card>
    </div>
  );
};

export default AuthForm;