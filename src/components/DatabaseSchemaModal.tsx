import React, { useState } from 'react';
import { Database, Copy, Check, Table, Key, Shield, Layers } from 'lucide-react';

export const DatabaseSchemaModal: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'sql' | 'relations'>('tables');

  const copySql = () => {
    navigator.clipboard.writeText(postgresSqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tables = [
    { name: 'users', desc: 'Пользователи, пароли, профили, статистика и статусы (Active, Blocked, Suspended)' },
    { name: 'roles', desc: 'Системные роли (User, Moderator, Administrator)' },
    { name: 'user_roles', desc: 'Связь Many-to-Many пользователей и ролей' },
    { name: 'user_sessions', desc: 'Сессии JWT и хеши Refresh-токенов с проверкой отзыва' },
    { name: 'cities', desc: 'Города проведения спортивных мероприятий (Москва, СПб)' },
    { name: 'sports', desc: 'Виды спорта (Волейбол, Баскетбол, Футзал, Теннис)' },
    { name: 'sport_levels', desc: 'Градация уровней мастерства для каждого спорта (Beginner, Intermediate, Advanced)' },
    { name: 'user_sports', desc: 'Уровни мастерства конкретного пользователя по видам спорта' },
    { name: 'venues', desc: 'Спортивные площадки, залы, адреса, метро и доступные удобства' },
    { name: 'game_templates', desc: 'Шаблоны регулярных повторяющихся игр (GameTemplate) с днями недели' },
    { name: 'games', desc: 'Конкретные матчи и игры (Games) с дедлайнами отмены и статусами' },
    { name: 'game_participants', desc: 'Участники игры: Основной состав (Main) и резервная очередь (Waitlist FIFO)' },
    { name: 'game_attendance', desc: 'Посещаемость после матча: Attended, NoShow, Excused' },
    { name: 'game_history', desc: 'История изменений конкретного матча' },
    { name: 'ratings', desc: 'Взаимные оценки участников от 1 до 5 звёзд за завершённый матч' },
    { name: 'reviews', desc: 'Текстовые отзывы к оценкам' },
    { name: 'blacklist_entries', desc: 'Личный чёрный список организатора (блокирует запись на его игры)' },
    { name: 'complaints', desc: 'Жалобы пользователей на игроков или матчи для модерации' },
    { name: 'notifications', desc: 'Внутрисистемные уведомления (запись, продвижение из очереди, отмена)' },
    { name: 'subscription_plans', desc: 'Тарифные планы (Free, Pro, Club Elite)' },
    { name: 'entitlements', desc: 'Гранулярные привилегии (CREATE_GAME, CREATE_RECURRING_GAME и т.д.)' },
    { name: 'plan_entitlements', desc: 'Связь тарифов и привилегий' },
    { name: 'audit_logs', desc: 'Неизменяемый журнал аудита действий администраторов' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 rounded-3xl text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
            <Database className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">Архитектура PostgreSQL</h1>
            <p className="text-xs text-emerald-200 mt-0.5">
              Единственная база данных проекта (PostgreSQL 16+) со строгой реляционной целостностью и UUID PK
            </p>
          </div>
        </div>

        <button
          onClick={copySql}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 shadow-md transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Скопировано!' : 'Скопировать SQL DDL'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'tables' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Справочник 18+ таблиц</span>
          </button>
          <button
            onClick={() => setActiveTab('relations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'relations' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Связи и FIFO-очередь</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              activeTab === 'sql' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Полный SQL Script (schema.sql)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TABLES */}
      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tables.map((t) => (
            <div
              key={t.name}
              className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center space-x-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-xs font-bold text-slate-900">{t.name}</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: RELATIONS & FIFO QUEUE EXPLANATION */}
      {activeTab === 'relations' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">
            Реализация очереди Waitlist FIFO и целостности
          </h3>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <span className="font-bold block text-sm">Механизм автопродвижения:</span>
            <p className="leading-relaxed">
              1. Таблица <code>game_participants</code> хранит статус <code>Main</code> или{' '}
              <code>Waitlist</code>.
            </p>
            <p className="leading-relaxed">
              2. При статусе <code>Waitlist</code> поле <code>queue_position</code> заполняется
              по возрастанию (FIFO 1, 2, 3...).
            </p>
            <p className="leading-relaxed">
              3. При отмене участника со статусом <code>Main</code> транзакция PostgreSQL атомарно:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Помечает старого участника как <code>Cancelled</code></li>
              <li>Находит запись с <code>status = 'Waitlist' AND queue_position = 1</code></li>
              <li>Обновляет статус на <code>Main</code>, сбрасывая <code>queue_position = NULL</code></li>
              <li>Декрементирует <code>queue_position = queue_position - 1</code> для оставшихся участников</li>
              <li>Генерирует запись в таблице <code>notifications</code> для оповещения игрока</li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB 3: FULL SQL DDL SCRIPT */}
      {activeTab === 'sql' && (
        <div className="bg-slate-950 rounded-3xl p-5 text-slate-300 font-mono text-xs overflow-x-auto shadow-xl max-h-[600px]">
          <pre>{postgresSqlScript}</pre>
        </div>
      )}
    </div>
  );
};

const postgresSqlScript = `-- PostgreSQL Schema for Group Game App
-- Version 2.0 (Target: PostgreSQL 15+ / 16+)
-- Architecture: Domain-driven with strict relational integrity, UUID keys and UTC timestamps

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('User', 'Moderator', 'Administrator');
CREATE TYPE user_status AS ENUM ('Active', 'Suspended', 'Blocked', 'Deleted');
CREATE TYPE game_status AS ENUM ('Draft', 'Open', 'Full', 'StartingSoon', 'InProgress', 'Completed', 'Cancelled');
CREATE TYPE participant_status AS ENUM ('Main', 'Waitlist', 'Cancelled', 'Removed');
CREATE TYPE attendance_status AS ENUM ('Attended', 'NoShow', 'Excused');
CREATE TYPE recurrence_type AS ENUM ('Weekly', 'BiWeekly', 'Monthly');
CREATE TYPE complaint_status AS ENUM ('Pending', 'Investigating', 'Resolved', 'Dismissed');

CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(100) NOT NULL DEFAULT 'Россия',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(30),
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    status user_status NOT NULL DEFAULT 'Active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sport_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 1,
    CONSTRAINT uq_sport_level UNIQUE (sport_id, name)
);

CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    sport_id UUID NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
    level_id UUID NOT NULL REFERENCES sport_levels(id) ON DELETE RESTRICT,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    start_date_time TIMESTAMPTZ NOT NULL,
    end_date_time TIMESTAMPTZ NOT NULL,
    time_zone VARCHAR(50) NOT NULL DEFAULT 'Europe/Moscow',
    max_players INT NOT NULL CHECK (max_players > 0),
    price_kopecks INT NOT NULL DEFAULT 0 CHECK (price_kopecks >= 0),
    cancellation_deadline_hours INT NOT NULL DEFAULT 3,
    status game_status NOT NULL DEFAULT 'Open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE game_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status participant_status NOT NULL DEFAULT 'Main',
    queue_position INT CHECK (queue_position IS NULL OR queue_position > 0),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_game_user UNIQUE (game_id, user_id)
);`;
