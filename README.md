# Cabinet Stomatologic — PWA

Aplicație internă (mobile-first PWA) pentru un cabinet stomatologic mic, cu un flux public de programare.
UI în limba română, cod în engleză.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma ORM
- Autentificare staff cu sesiune JWT (cookie httpOnly) via `jose` + `bcryptjs`
- PWA: manifest + service worker
- Email mock (pregătit pentru Resend)

## Cerințe

- Node 20+
- PostgreSQL

## Pornire rapidă

```bash
# 1. Instalează dependențele
npm install

# 2. Configurează variabilele de mediu
cp .env.example .env
#   editează DATABASE_URL și AUTH_SECRET dacă e nevoie

# 3. Creează schema în baza de date
npm run db:push

# 4. Populează cu date demo
npm run db:seed

# 5. Pornește în dezvoltare
npm run dev
# -> http://localhost:3000
```

Build de producție:

```bash
npm run build
npm run start
```

## Comenzi

| Comandă             | Descriere                              |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Server de dezvoltare                   |
| `npm run build`     | Build de producție                     |
| `npm run start`     | Pornește build-ul de producție         |
| `npm run db:push`   | Sincronizează schema Prisma cu DB      |
| `npm run db:seed`   | Inserează date demo                    |
| `npm run db:studio` | Prisma Studio (vizualizare DB)         |

## Conturi de test (după seed)

| Email               | Parolă      | Rol   |
| ------------------- | ----------- | ----- |
| `admin@cabinet.ro`  | `parola123` | ADMIN |
| `staff@cabinet.ro`  | `parola123` | STAFF |

## Variabile de mediu

| Variabilă             | Descriere                                          |
| --------------------- | -------------------------------------------------- |
| `DATABASE_URL`        | String conexiune PostgreSQL                        |
| `AUTH_SECRET`         | Secret pentru semnarea sesiunilor (min. 32 chars)  |
| `NEXT_PUBLIC_APP_URL` | URL public (folosit în linkul de programare email) |
| `EMAIL_PROVIDER`      | `mock` (implicit). Viitor: `resend`                |

## Rute

Interne (protejate, doar staff):

- `/login` — autentificare
- `/dashboard` — programări azi, viitoare, recall, acțiuni rapide
- `/patients`, `/patients/new`, `/patients/[id]`, `/patients/[id]/edit`
- `/patients/[id]/interventions/new`
- `/calendar` — calendar săptămânal, filtrare pe medic, creare programări
- `/reminders` — recall la 6 luni, trimitere email
- `/settings` — medici, program, șablon email

Public (fără cont):

- `/book` — introducere telefon
- `/book/slots` — alegere interval
- `/book/success` — confirmare

## Logica de business

- **Program:** Ruxi Luni–Miercuri, Colega Joi–Sâmbătă, Duminică închis, 09:00–17:00, sloturi de 30 min.
- **Recall:** după o intervenție `CONTROL` sau `DETARTRAJ`, data de recall se setează la +6 luni.
- **Programare publică:** pacientul introduce telefonul → se normalizează → se caută pacientul →
  se detectează medicul asignat → se afișează doar sloturile libere ale acelui medic.

## Securitate & confidențialitate

- Rute interne protejate prin middleware + verificare sesiune.
- Structură de roluri: `ADMIN` / `DENTIST` / `STAFF`.
- `AuditLog` pentru acțiuni sensibile (login, creare/editare pacient, programări, remindere).
- Fluxul public **nu** expune istoric medical, intervenții, alergii, note sau alți pacienți.
- Mesaje de eroare generice la căutarea după telefon (anti-enumerare).
- Rate limiting de bază pe lookup-ul de telefon (în memorie).
- Token de programare semnat, de scurtă durată — structură pregătită pentru OTP.

## Limitări cunoscute

- Rate limiting este in-memory (per instanță). Pentru producție: Redis/Upstash.
- Editarea programului medicilor și a șablonului email se face momentan din seed/DB
  (UI-ul afișează datele; structura suportă extinderea cu formulare).
- Email este mock (loghează în consolă). Integrarea Resend necesită cod suplimentar.
- OTP pentru programarea publică nu este implementat (structura e pregătită).
- Iconițele PWA sunt placeholdere generate.
- Fără date reale de pacienți — totul este demo.
