/**
 * members-data.js — СПИСОК УЧАСТНИКОВ ГРУППЫ «ПОКОЛЕНИЕ»
 *
 * Как заполнять:
 *   name     — Имя и Фамилия
 *   telegram — Telegram-ник (без @, например: ivan_petrov)
 *   photo    — путь к фото (например: "images/members/ivan.jpg") или null
 *   clubs    — клубы: любые из "sport", "english", "reading"
 *
 * Когда пришлёшь список — просто заменяем эти строки реальными данными.
 */

const GROUP_MEMBERS = [
  // ──────────────── ЗАМЕНИ НА РЕАЛЬНЫЕ ДАННЫЕ ────────────────
  { id: "p01",  name: "Участник 1",  telegram: "username1",  photo: null, clubs: ["sport", "english", "reading"] },
  { id: "p02",  name: "Участник 2",  telegram: "username2",  photo: null, clubs: ["sport"] },
  { id: "p03",  name: "Участник 3",  telegram: "username3",  photo: null, clubs: ["english", "reading"] },
  { id: "p04",  name: "Участник 4",  telegram: "username4",  photo: null, clubs: ["sport", "reading"] },
  { id: "p05",  name: "Участник 5",  telegram: "username5",  photo: null, clubs: ["sport"] },
  { id: "p06",  name: "Участник 6",  telegram: "username6",  photo: null, clubs: ["english"] },
  { id: "p07",  name: "Участник 7",  telegram: "username7",  photo: null, clubs: ["sport", "english"] },
  { id: "p08",  name: "Участник 8",  telegram: "username8",  photo: null, clubs: ["reading"] },
  { id: "p09",  name: "Участник 9",  telegram: "username9",  photo: null, clubs: ["sport"] },
  { id: "p10",  name: "Участник 10", telegram: "username10", photo: null, clubs: ["sport", "reading"] },
  // Добавляй строки ниже по такому же образцу до p55 ...
];
