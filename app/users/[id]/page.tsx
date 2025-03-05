"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Descriptions, Spin, Alert, message } from "antd";

const UserProfile: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const apiService = useApi();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { clear: clearToken } = useLocalStorage<string>("token", "");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId || userId !== id) {
          console.error("Unauthorized access, redirecting to login.");
          router.push("/login");
          return;
        }

        setLoading(true);
        const userData = await apiService.get<User>(`/users/${id}`, {
          headers: { Authorization: `Bearer ${token}`, "User-Id": userId },
        });

        setUser(userData);
      } catch (err) {
        setError("Failed to fetch user data.");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, apiService, router]);

  return (
    <div className="card-container">
      <Card title="User Profile" className="dashboard-container">
        {loading ? (
          <Spin size="large" />
        ) : error ? (
          <Alert message={error} type="error" />
        ) : user ? (
          <>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
              <Descriptions.Item label="Name">{user.name || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Status">{user.status}</Descriptions.Item>
              <Descriptions.Item label="Birthdate">
                {user.birthdate ? new Date(user.birthdate).toLocaleDateString() : "Not set"}
              </Descriptions.Item>
              <Descriptions.Item label="User ID">{user.id}</Descriptions.Item>
            </Descriptions>
            <Button onClick={() => router.push("/users")} type="default" style={{ marginTop: 16 }}>Back to Users</Button>
          </>
        ) : (
          <Alert message="User not found." type="warning" />
        )}
      </Card>
    </div>
  );
};

export default UserProfile;