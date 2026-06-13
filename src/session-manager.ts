export interface DeviceInfo {
  id: string;
  name: string;
  lastActive: number;
  ip?: string;
}

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private devices: Map<string, DeviceInfo> = new Map();

  createSession(userId: string, device: DeviceInfo, ttlHours = 24): Session {
    const session: Session = {
      id: crypto.randomUUID(),
      userId,
      deviceId: device.id,
      token: crypto.randomUUID(),
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlHours * 60 * 60 * 1000,
      lastActivity: Date.now(),
    };
    this.sessions.set(session.id, session);
    this.devices.set(device.id, device);
    return session;
  }

  validateSession(token: string): Session | null {
    for (const session of this.sessions.values()) {
      if (session.token === token) {
        if (Date.now() > session.expiresAt) {
          this.sessions.delete(session.id);
          return null;
        }
        session.lastActivity = Date.now();
        return session;
      }
    }
    return null;
  }

  revokeSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  revokeAllUserSessions(userId: string): number {
    let count = 0;
    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(id);
        count++;
      }
    }
    return count;
  }

  getDevices(): DeviceInfo[] {
    return Array.from(this.devices.values());
  }
}
