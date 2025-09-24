// src/services/dataService.ts
import { Tutor, Student, Module } from "../types";

export async function fetchWithAuth<T>(url: string): Promise<T> {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Backend error response:", errorText);
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
}

export async function getTutors(): Promise<Tutor[]> {
  return fetchWithAuth<Tutor[]>("http://localhost:9090/tutors");
}

export async function getStudentById(id: string): Promise<Student> {
  return fetchWithAuth<Student>(`http://localhost:9090/student/${id}`);
}

export async function getModules(): Promise<Module[]> {
  return fetchWithAuth<Module[]>("http://localhost:9090/modules");
}
