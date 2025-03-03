// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client"; 

import React, { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";
import { Card, Button, Spin, Alert } from "antd";
import { User } from "@/types/user";

export const dynamic = "force-dynamic";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export default function UserPage({ params }: UserPageProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const apiService = useApi();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((resolvedParams) => {
      setUserId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const data = await apiService.get<User>(`/users/${userId}`);
        setUser(data);
      } catch (err) {
        setError("Failed to fetch user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, apiService]);

  if (loading) return <Spin size="large" />;
  if (error) return <Alert message={error} type="error" />;

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <Card title={`${user?.name} (@${user?.username})`} bordered>
        <p><strong>ID:</strong> {user?.id}</p>
        <p><strong>Online Status:</strong> {user?.online ? "Online ✅" : "Offline ❌"}</p>
        <p><strong>Account Created:</strong> {new Date(user?.createdAt || "").toLocaleDateString()}</p>
        {user?.birthDate && <p><strong>Birth Date:</strong> {new Date(user.birthDate).toLocaleDateString()}</p>}
        <Button onClick={() => router.push("/users")} type="primary">Back to Users</Button>
      </Card>
    </div>
  );
}