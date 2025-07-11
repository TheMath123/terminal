"use client"

import { useMemo } from "react"
import type { User } from "@/types/terminal"

export const useUsers = () => {
  const users: { [key: string]: User } = useMemo(
    () => ({
      user: {
        name: "user",
        hasPassword: false,
        commands: [
          "help",
          "clear",
          "whoami",
          "date",
          "echo",
          "calc",
          "pwd",
          "ls",
          "cd",
          "mkdir",
          "cat",
          "neofetch",
          "su",
          "find",
          "tree",
        ],
        isAdmin: false,
      },
      root: {
        name: "root",
        hasPassword: true,
        password: "admin123",
        commands: [
          "help",
          "clear",
          "whoami",
          "date",
          "echo",
          "calc",
          "pwd",
          "ls",
          "cd",
          "mkdir",
          "cat",
          "neofetch",
          "exit",
          "iptables",
          "ufw",
          "systemctl",
          "netstat",
          "ps",
          "top",
          "df",
          "free",
          "useradd",
          "passwd",
          "find",
          "tree",
        ],
        isAdmin: true,
      },
      admin: {
        name: "admin",
        hasPassword: true,
        password: "senha123",
        commands: [
          "help",
          "clear",
          "whoami",
          "date",
          "echo",
          "calc",
          "pwd",
          "ls",
          "cd",
          "mkdir",
          "cat",
          "neofetch",
          "exit",
          "systemctl",
          "ps",
          "find",
          "tree",
        ],
        isAdmin: true,
      },
      guest: {
        name: "guest",
        hasPassword: false,
        commands: ["help", "clear", "whoami", "date", "echo", "pwd", "ls", "cat"],
        isAdmin: false,
      },
    }),
    [],
  )

  const getCurrentUser = (currentUser: string) => users[currentUser]

  const getAvailableCommands = (currentUser: string) => {
    const user = getCurrentUser(currentUser)
    return user ? user.commands : []
  }

  const hasCommand = (command: string, currentUser: string) => {
    return getAvailableCommands(currentUser).includes(command)
  }

  return {
    users,
    getCurrentUser,
    getAvailableCommands,
    hasCommand,
  }
}
