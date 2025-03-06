"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { User } from "@/types/user";
import { Button, Card, Descriptions, Spin, Alert, Input, message } from "antd";
import { getApiDomain } from "@/utils/domain";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UserProfile: React.FC = () => {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  
  // ✅ Directly retrieve session data instead of relying on useEffect
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const isOwnProfile = userId && id && userId === id.toString();

  // Editable fields
  const [editableUsername, setEditableUsername] = useState("");
  const [editableBirthdate, setEditableBirthdate] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token || !userId) {
        console.error("🚨 No session found, redirecting to login.");
        router.push("/login");
        return;
      }
    
      setLoading(true);
    
      try {
        const apiBase = getApiDomain();
        const response = await fetch(`${apiBase}/users/${id}?userId=${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
    
        if (!response.ok) {
          console.error("Failed to fetch user:", response.statusText);
          setError("Failed to fetch user data.");
          return;
        }
    
        const userData = await response.json();
        setUser(userData);
        setEditableUsername(userData.username);
        setEditableBirthdate(userData.birthDate);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Error fetching user data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, router, token, userId]);

  const handleSaveChanges = async () => {
    if (!token || !userId) {
      message.error("Session expired. Please log in again.");
      return;
    }
  
    try {
      const updatedData: Partial<User> = {};
      if (editableUsername !== user?.username) updatedData.username = editableUsername;
      if (editableBirthdate !== user?.birthDate) updatedData.birthDate = editableBirthdate;
  
      if (Object.keys(updatedData).length === 0) {
        message.info("No changes detected.");
        setIsEditing(false);
        return;
      }
  
      const apiBase = getApiDomain();
      const response = await fetch(`${apiBase}/users/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Token is now used for validation
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData), // ✅ No `requestingUserId`
      });
  
      if (response.status === 204) {
        // ✅ 204 No Content - Update local state manually
        messageApi.open({
          type: "success",
          content: <span style={{ color: "black" }}>Profile updated successfully!</span>,
        });
  
        setUser((prevUser) => (prevUser ? { ...prevUser, ...updatedData } : prevUser));
        setIsEditing(false);
        return;
      }
  
      if (!response.ok) {
        throw new Error("Failed to update user.");
      }
  
    } catch (err) {
      console.error("Error updating user:", err);
      
      messageApi.open({
        type: "error",
        content: <span style={{ color: "black" }}>Failed to update profile. Try again.</span>,
      });
    }
  };

  return (
    <div className="card-container" style={{ color: "white" }}>
      {contextHolder}
      <Card
        title={<span style={{ color: "white" }}>Profile Page</span>} 
        className="dashboard-container"
      >
        {loading ? (
          <Spin size="large" />
        ) : error ? (
          <Alert message={error} type="error" />
        ) : user ? (
          <>
            <Descriptions bordered column={1} style={{ color: "white" }}>
              <Descriptions.Item label={<span style={{ color: "white" }}>Username</span>}>
                {isOwnProfile && isEditing ? (
                  <Input 
                    value={editableUsername} 
                    onChange={(e) => setEditableUsername(e.target.value)}
                    style={{ color: "white", backgroundColor: "#333", borderColor: "white" }} 
                  />
                ) : (
                  <span style={{ color: "white" }}>{user.username}</span>
                )}
              </Descriptions.Item>
  
              <Descriptions.Item label={<span style={{ color: "white" }}>Status</span>}>
                <span style={{ color: "white" }}>{user.status}</span>
              </Descriptions.Item>
  
              <Descriptions.Item label={<span style={{ color: "white" }}>Creation Date</span>}>
                <span style={{ color: "white" }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Not set"}
                </span>
              </Descriptions.Item>
  
              <Descriptions.Item label={<span style={{ color: "white" }}>Birthdate</span>}>
                {isOwnProfile && isEditing ? (
                  <div className="custom-datepicker-wrapper">
                    <DatePicker
                      selected={editableBirthdate ? new Date(editableBirthdate) : null}
                      onChange={(date) => setEditableBirthdate(date ? date.toISOString().split("T")[0] : null)}
                      className="custom-datepicker"
                    />
                  </div>
                ) : (
                  <span style={{ color: "white" }}>
                    {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : "Not set"}
                  </span>
                )}
              </Descriptions.Item>
            </Descriptions>
  
            {isOwnProfile && (
              <>
                {isEditing ? (
                  <>
                    <Button 
                      type="primary" 
                      onClick={handleSaveChanges} 
                      style={{ marginTop: 16 }}
                    >
                      Save Changes
                    </Button>
                    <Button 
                      onClick={() => setIsEditing(false)} 
                      style={{ marginTop: 16, marginLeft: 8 }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    type="primary" 
                    style={{ marginTop: 16, backgroundColor: "#4CAF50", borderColor: "#4CAF50" }}
                  >
                    Edit Profile
                  </Button>
                )}
              </>
            )}
  
            <Button 
              onClick={() => router.push("/users")} 
              type="default" 
              style={{ marginTop: 16, marginLeft: 8 }}
            >
              Back to Users
            </Button>
          </>
        ) : (
          <Alert message="User not found." type="warning" />
        )}
      </Card>
    </div>
  );
}

export default UserProfile;