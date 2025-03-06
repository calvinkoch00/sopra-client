"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Card, Table, message } from "antd";
import type { TableProps } from "antd";

import { getApiDomain } from "@/utils/domain";

// ✅ Only keep the Username column
const columns: TableProps<User>["columns"] = [
  {
    title: "Username",
    dataIndex: "username",
    key: "username",
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

      const apiBase = getApiDomain();

      // ✅ Correct API call for logout (PUT request)
      const response = await fetch(`${apiBase}/users/${userId}/logout`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
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

        const apiBase = getApiDomain();
        const response = await fetch(`${apiBase}/users?userId=${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        setUsers(data);
      } catch (error: unknown) {
        console.error("Error fetching users:", error);
      
        if (typeof error === "object" && error !== null && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 401) {
            console.warn("Session expired, redirecting to login.");
            router.push("/login");
          } else {
            message.error("Failed to fetch users. Please try again.");
          }
        } else {
          message.error("An unexpected error occurred.");
        }
      }
    };

    if (localStorage.getItem("token")) {
      fetchUsers();
    }
  }, [apiService, router]);

  return (
    <div className="card-container" style={{ display: "flex", justifyContent: "center" }}> 
    <Card 
      title="User Overview" 
      loading={!users} 
      className="dashboard-container"
      style={{ minWidth: "330px" }} // ✅ Ensures card doesn't shrink below 500px
    >
        {users && (
          <>
            <Table<User>
              columns={columns}
              dataSource={users}
              rowKey="id"
              onRow={(row) => ({
                onClick: () => router.push(`/users/${row.id}`),
                style: { cursor: "pointer" },
              })}
              pagination={{
                position: ["bottomRight"],
                itemRender: (page, type) => {
                  if (type === "prev") {
                    return <a style={{ color: "white", fontSize: "16px", padding: "4px 10px" }}>←</a>;
                  }
                  if (type === "next") {
                    return <a style={{ color: "white", fontSize: "16px", padding: "4px 10px" }}>→</a>;
                  }
                  return (<span>{page}</span>);
                },
                showSizeChanger: false,
                showLessItems: true,
                style: {
                  border: "none",
                  background: "none",
                },
              }}
            />
            {/* ✅ Make Logout button red */}
            <Button
              onClick={handleLogout}
              type="primary"
              danger
              style={{ marginTop: 16 }}
            >
              Logout
            </Button>
          </>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;