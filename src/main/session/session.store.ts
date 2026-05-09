import { User } from "@shared/types";

let currentUser: User | null = null

export function setCurrentUser(user: User | null) {
    currentUser = user
}

export function getCurrentUser() {
    return currentUser
}