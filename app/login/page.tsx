"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Form, Input, DatePicker } from "antd";

const AuthForm: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  const [isLoginMode, setIsLoginMode] = useState(true); // Toggle state

  const { set: setToken } = useLocalStorage<string>("token", "");

  // Handles login or registration submission
  const handleSubmit = async (values: any) => {
    try {
        const formattedValues = {
            username: values.username,
            password: values.password,
        };

        const endpoint = isLoginMode ? "/login" : "/register";
        const response = await apiService.post(endpoint, formattedValues);

        // ✅ If registering, immediately log in using the same credentials
        if (!isLoginMode) {
            const loginResponse = await apiService.post("/login", formattedValues);
            if (loginResponse.token) {
                setToken(loginResponse.token);
                localStorage.setItem("userId", loginResponse.id);
                router.push("/users"); // Redirect to users page
            }
        } else {
            // ✅ If logging in directly, store token and redirect
            if (response.token) {
                setToken(response.token);
                localStorage.setItem("userId", response.id);
                router.push("/users");
            }
        }
    } catch (error) {
        console.error("Error:", error);
        alert(`Something went wrong:\n${error.message}`);
    }
};

  return (
    <div className="auth-container">
      <Card
        title={isLoginMode ? "Login" : "Register"}
        className="auth-card"
      >
        <Form
          form={form}
          name="authForm"
          size="large"
          onFinish={handleSubmit}
          layout="vertical"
        >
          {/* Username Field */}
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Enter Username" />
          </Form.Item>

          {/* Password Field */}
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter Password" />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="auth-button">
              {isLoginMode ? "Login" : "Register"}
            </Button>
          </Form.Item>
        </Form>

        {/* Toggle Button */}
        <Button type="link" onClick={() => setIsLoginMode(!isLoginMode)}>
          {isLoginMode ? "Don't have an account? Register" : "Already have an account? Login"}
        </Button>
      </Card>
    </div>
  );
};

export default AuthForm;
