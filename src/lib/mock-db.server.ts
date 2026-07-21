"use server";

import * as fs from "fs";
import * as path from "path";

// Ensure mock db file exists
const isServer = typeof window === "undefined" && typeof process !== "undefined" && typeof process.cwd === "function";
const DB_PATH = isServer ? path.join(process.cwd(), "mock-db.json") : "";

interface MockDB {
  users: any[];
  workspaceItems: any[];
  calendarEvents: any[];
  analyticsSnapshots: any[];
}

function loadDB(): MockDB {
  if (!isServer) {
    return { users: [], workspaceItems: [], calendarEvents: [], analyticsSnapshots: [] };
  }
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initial: MockDB = {
        users: [
          {
            id: "mock-user-1",
            email: "user@sodia.ai",
            fullName: "Alex Rivera",
            avatarUrl: null,
            role: "USER",
            credits: 42,
            brandVoice: "Conversational, professional, and slightly witty. Prefers concise insights.",
            stripeCustomerId: "cus_mock_123",
            stripeSubscriptionId: "sub_mock_123",
            stripePriceId: "price_pro",
            stripeStatus: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "mock-admin-1",
            email: "admin@sodia.ai",
            fullName: "Sodia Admin",
            avatarUrl: null,
            role: "ADMIN",
            credits: 999,
            brandVoice: "Authoritative and technical",
            stripeCustomerId: "cus_mock_admin",
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeStatus: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ],
        workspaceItems: [],
        calendarEvents: [],
        analyticsSnapshots: [
          { id: "s1", userId: "mock-user-1", platform: "x", views: 1240, clicks: 88, likes: 95, shares: 12, date: new Date().toISOString() },
          { id: "s2", userId: "mock-user-1", platform: "linkedin", views: 2450, clicks: 190, likes: 210, shares: 45, date: new Date().toISOString() },
          { id: "s3", userId: "mock-user-1", platform: "instagram", views: 5600, clicks: 310, likes: 580, shares: 92, date: new Date().toISOString() }
        ],
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return { users: [], workspaceItems: [], calendarEvents: [], analyticsSnapshots: [] };
  }
}

function saveDB(db: MockDB) {
  if (!isServer) return;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save mock database:", e);
  }
}

export const mockDb = {
  getUsers: () => loadDB().users,
  getUserById: (id: string) => loadDB().users.find((u) => u.id === id),
  getUserByEmail: (email: string) => loadDB().users.find((u) => u.email === email),
  saveUser: (user: any) => {
    const db = loadDB();
    const idx = db.users.findIndex((u) => u.id === user.id);
    const updatedUser = { ...user, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      db.users[idx] = updatedUser;
    } else {
      updatedUser.createdAt = new Date().toISOString();
      db.users.push(updatedUser);
    }
    saveDB(db);
    return updatedUser;
  },

  getWorkspaceItems: (userId: string) => loadDB().workspaceItems.filter((item) => item.userId === userId),
  getWorkspaceItemById: (id: string) => loadDB().workspaceItems.find((item) => item.id === id),
  saveWorkspaceItem: (item: any) => {
    const db = loadDB();
    const id = item.id || Math.random().toString(36).substring(2, 11);
    const newItem = {
      id,
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const idx = db.workspaceItems.findIndex((w) => w.id === id);
    if (idx >= 0) {
      db.workspaceItems[idx] = newItem;
    } else {
      db.workspaceItems.push(newItem);
    }
    saveDB(db);
    return newItem;
  },
  deleteWorkspaceItem: (id: string) => {
    const db = loadDB();
    db.workspaceItems = db.workspaceItems.filter((w) => w.id !== id);
    db.calendarEvents = db.calendarEvents.filter((c) => c.workspaceItemId !== id);
    saveDB(db);
    return true;
  },

  getCalendarEvents: (userId: string) => loadDB().calendarEvents.filter((e) => e.userId === userId),
  saveCalendarEvent: (event: any) => {
    const db = loadDB();
    const id = event.id || Math.random().toString(36).substring(2, 11);
    const newEvent = {
      id,
      ...event,
      createdAt: event.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const idx = db.calendarEvents.findIndex((c) => c.id === id);
    if (idx >= 0) {
      db.calendarEvents[idx] = newEvent;
    } else {
      db.calendarEvents.push(newEvent);
    }
    saveDB(db);
    return newEvent;
  },
  deleteCalendarEvent: (id: string) => {
    const db = loadDB();
    db.calendarEvents = db.calendarEvents.filter((c) => c.id !== id);
    saveDB(db);
    return true;
  },

  getAnalyticsSnapshots: (userId: string) => loadDB().analyticsSnapshots.filter((s) => s.userId === userId),
  saveAnalyticsSnapshot: (snapshot: any) => {
    const db = loadDB();
    const id = snapshot.id || Math.random().toString(36).substring(2, 11);
    const newSnapshot = { id, ...snapshot, date: snapshot.date || new Date().toISOString() };
    db.analyticsSnapshots.push(newSnapshot);
    saveDB(db);
    return newSnapshot;
  }
};
