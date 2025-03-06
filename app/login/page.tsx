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
  
      const response = (await apiService.post(endpoint, formattedValues)) as Response;
      const responseData: { token?: string; id?: string } = await response.json();


      console.log("📢 API Response:", responseData);
  
      if (!isLoginMode) {
        console.log("✅ Registration successful, attempting login...");
  
        await new Promise(resolve => setTimeout(resolve, 1000));
  
        const loginResponse = (await apiService.post("/login", formattedValues)) as Response;
        const loginData = (await loginResponse.json()) as { token?: string; id?: string };

        const authToken = loginData.token || null;
        const userId = loginData.id || null;
  
        if (authToken) {
          setToken(authToken);
          localStorage.setItem("token", authToken);
          if (userId) localStorage.setItem("userId", userId);
          router.push("/users");
        } else {
          throw new Error("Login failed after registration.");
        }
      } else {
        const authToken = responseData.token || null;
        const userId = responseData.id || null;
  
        if (authToken) {
          setToken(authToken);
          localStorage.setItem("token", authToken);
          if (userId) localStorage.setItem("userId", userId);
          router.push("/users");
        } else {
          throw new Error("Token not found in response.");
        }
      }
    } catch (error) {
      console.error("🚨 Error:", error);
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