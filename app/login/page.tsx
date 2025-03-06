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

  const handleSubmit = async (values: any) => {
    try {
      const formattedValues = {
        username: values.username,
        password: values.password,
      };

      const endpoint = isLoginMode ? "/login" : "/register";
      const response = await apiService.post(endpoint, formattedValues);

      if (!isLoginMode) {
        const loginResponse = await apiService.post("/login", formattedValues);
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
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("🚨 Login Error:", error);
      }
    
      let errorMessage = "Something went wrong.";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message; 
      } else if (error.message) {
        errorMessage = error.message;
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