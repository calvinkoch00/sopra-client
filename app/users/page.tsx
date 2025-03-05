"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table, message } from "antd";
import type { TableProps } from "antd";

const columns: TableProps<User>["columns"] = [
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Id",
    dataIndex: "id",
    key: "id",
  },
];

const Dashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [users, setUsers] = useState<User[] | null>(null);

  const { clear: clearToken } = useLocalStorage<string>("token", "");

  const handleLogout = async (): Promise<void> => {
    try {
      const userId = localStorage.getItem("userId") || "";
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        console.error("No valid session found.");
        router.push("/login");
        return;
      }

      const response = await fetch(`/users?userId=${userId}`, {
        method: "GET",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200 || response.message === "User successfully logged out.") {
        clearToken();
        localStorage.removeItem("userId");
        router.push("/login");
      } else {
        console.error("Logout failed:", response);
        message.error("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Error logging out.");
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
    
        if (!token || !userId) {
          console.error("No session found, redirecting to login.");
          router.push("/login");
          return;
        }
    
        // ✅ Use GET method and send userId as a query parameter
        const response = await fetch(`/users?userId=${userId}`, {
          method: "GET",
          headers: {
            Authorization: `${token}`,  // ✅ Ensure token is passed correctly
            "Content-Type": "application/json",
          },
        });
    
        const data = await response.json(); // ✅ Properly parse the JSON response
        setUsers(data); // ✅ Correctly set the users// ✅ Fix: use response.data
      } catch (error) {
        console.error("Error fetching users:", error);
    
        if (error.response?.status === 401) {
          console.warn("Session expired, redirecting to login.");
          router.push("/login");
        } else {
          message.error("Failed to fetch users. Please try again.");
        }
      }
    };
  
    if (localStorage.getItem("token")) {
      fetchUsers();
    }
  }, [apiService, router]);

  return (
    <div className="card-container">
      <Card title="Get all users from secure endpoint:" loading={!users} className="dashboard-container">
        {users && (
          <>
            <Table<User> columns={columns} dataSource={users} rowKey="id" onRow={(row) => ({
              onClick: () => router.push(`/users/${row.id}`),
              style: { cursor: "pointer" },
            })} />
            <Button onClick={handleLogout} type="primary">Logout</Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;