import MockAdapter from 'axios-mock-adapter';
import api from './axios';
import {
  MOCK_USERS,
  MOCK_TICKETS,
  MOCK_COMMENTS,
  MOCK_DASHBOARD,
} from './mockData';
import type { Ticket } from '../types';

// Estado mutable en memoria para simular CRUD
let tickets = [...MOCK_TICKETS];
let users = [...MOCK_USERS];
const comments = { ...MOCK_COMMENTS };
let commentCounter = 100;

export function setupMocks() {
  const mock = new MockAdapter(api, { delayResponse: 300 });

  // ── Auth ──────────────────────────────────────────────────────────────────
  mock.onPost('/auth/login').reply(({ data }) => {
    const { email } = JSON.parse(data);
    const user = users.find((u) => u.email === email) ?? users[0];
    return [200, { user }];
  });

  mock.onPost('/auth/logout').reply(200, {});

  mock.onGet('/auth/me').reply(() => {
    const stored = localStorage.getItem('auth-store');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.user) return [200, parsed.state.user];
    }
    return [200, MOCK_USERS[0]];
  });

  // ── Tickets ───────────────────────────────────────────────────────────────
  mock.onGet('/tickets').reply(({ params }) => {
    let result = tickets.filter((t) => !t.archivedAt);
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (params?.status?.length) result = result.filter((t) => params.status.includes(t.status));
    if (params?.priority?.length) result = result.filter((t) => params.priority.includes(t.priority));
    return [200, { data: result, total: result.length, page: 1, limit: 100 }];
  });

  mock.onGet(/\/tickets\/export\/csv/).reply(200, 'id,title\n', { 'Content-Type': 'text/csv' });
  mock.onGet(/\/tickets\/export\/pdf/).reply(200, '', { 'Content-Type': 'application/pdf' });

  mock.onGet(/\/tickets\/([^/]+)$/).reply((config) => {
    const id = config.url!.split('/').pop()!;
    const ticket = tickets.find((t) => t.id === id);
    return ticket ? [200, ticket] : [404, { message: 'No encontrado' }];
  });

  mock.onPost('/tickets').reply(({ data }) => {
    const body = JSON.parse(data);
    const newTicket: Ticket = {
      id: `ticket-${Date.now()}`,
      title: body.title,
      description: body.description ?? null,
      status: 'por_hacer',
      priority: body.priority ?? 'media',
      createdBy: MOCK_USERS[0],
      assignedTo: body.assignedTo ? users.find((u) => u.id === body.assignedTo) ?? null : null,
      labels: [],
      archivedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tickets = [newTicket, ...tickets];
    return [201, newTicket];
  });

  mock.onPatch(/\/tickets\/([^/]+)\/archive$/).reply((config) => {
    const id = config.url!.replace('/archive', '').split('/').pop()!;
    tickets = tickets.map((t) =>
      t.id === id ? { ...t, archivedAt: new Date().toISOString() } : t
    );
    return [200, tickets.find((t) => t.id === id)];
  });

  mock.onPatch(/\/tickets\/([^/]+)$/).reply((config) => {
    const id = config.url!.split('/').pop()!;
    const body = JSON.parse(config.data);
    tickets = tickets.map((t) =>
      t.id === id ? { ...t, ...body, updatedAt: new Date().toISOString() } : t
    );
    return [200, tickets.find((t) => t.id === id)];
  });

  // ── Comentarios ───────────────────────────────────────────────────────────
  mock.onGet(/\/tickets\/([^/]+)\/comments$/).reply((config) => {
    const ticketId = config.url!.split('/')[2];
    return [200, comments[ticketId] ?? []];
  });

  mock.onPost(/\/tickets\/([^/]+)\/comments$/).reply((config) => {
    const ticketId = config.url!.split('/')[2];
    const { content } = JSON.parse(config.data);
    const newComment = {
      id: `comment-${commentCounter++}`,
      ticketId,
      user: MOCK_USERS[0],
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    comments[ticketId] = [...(comments[ticketId] ?? []), newComment];
    return [201, newComment];
  });

  mock.onPatch(/\/tickets\/([^/]+)\/comments\/([^/]+)$/).reply((config) => {
    const parts = config.url!.split('/');
    const ticketId = parts[2];
    const commentId = parts[4];
    const { content } = JSON.parse(config.data);
    comments[ticketId] = (comments[ticketId] ?? []).map((c) =>
      c.id === commentId ? { ...c, content, updatedAt: new Date().toISOString() } : c
    );
    return [200, comments[ticketId]?.find((c) => c.id === commentId)];
  });

  mock.onDelete(/\/tickets\/([^/]+)\/comments\/([^/]+)$/).reply((config) => {
    const parts = config.url!.split('/');
    const ticketId = parts[2];
    const commentId = parts[4];
    comments[ticketId] = (comments[ticketId] ?? []).filter((c) => c.id !== commentId);
    return [204];
  });

  // ── Dashboard ─────────────────────────────────────────────────────────────
  mock.onGet('/dashboard/metrics').reply(200, MOCK_DASHBOARD);

  // ── Admin usuarios ────────────────────────────────────────────────────────
  mock.onGet('/admin/users').reply(200, users);

  mock.onPost('/admin/users').reply(({ data }) => {
    const body = JSON.parse(data);
    const newUser = {
      id: `user-${Date.now()}`,
      ...body,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users = [...users, newUser];
    return [201, newUser];
  });

  mock.onPatch(/\/admin\/users\/([^/]+)\/deactivate$/).reply((config) => {
    const id = config.url!.split('/')[3];
    users = users.map((u) => u.id === id ? { ...u, active: false } : u);
    return [200, users.find((u) => u.id === id)];
  });

  mock.onPatch(/\/admin\/users\/([^/]+)\/promote$/).reply((config) => {
    const id = config.url!.split('/')[3];
    users = users.map((u) => u.id === id ? { ...u, role: 'admin' } : u);
    return [200, users.find((u) => u.id === id)];
  });

  console.log('🟡 [MOCK MODE] Backend simulado activo');
}
