# תוכנית חפיפה - צוות גלי ישראל

מוצר החפיפה: **Site Planner – מתכנן אתרי תקשורת**. הפרוטוטייפ בריפו הזה הוא היעד. במהלך 8 שבועות (0–7) המתכנת בונה את המוצר מאפס בריפו משלו (`galey-onboarding`), Full-Stack: React 19 + TypeScript, MUI v9 (RTL), Axios, TanStack Query v5, MapLibre GL JS v6, NestJS 12, PostgreSQL 18 + TypeORM.

## עקרונות
- כל שבוע = גרסה: tag, CHANGELOG ודמו מול הפרוטוטייפ.
- כל משימה = PR נפרד עם Code review.
- משימה גמורה רק אחרי אישור ראש הצוות.
- משימה חסומה יותר מיום = מדברים על זה מיד.
- 1:1 שבועי של 30 דק' ביום חמישי. באדי 15–30 דק' ביום בשבועיים הראשונים, אחר כך 2–3 פעמים בשבוע.
- ציונים במטריצת המיומנויות (1–4): סוף שבוע 3, סוף שבוע 5 וסיום.

## תיק החפיפה
הריפו `galey-onboarding` הוא התיק: הקוד, תגיות v0.1–v1.0, `CHANGELOG.md`, ותיקיית `docs/` עם PRD, ERD, ADRs, צילומי מסך, דמו שבועי ו-retro. התבניות נמצאות בתיקיית `docs/` של הריפו הזה.

## גרסאות

| שבוע | מה עובד בסוף השבוע | תוצר לתיק |
|---|---|---|
| 0 - הכרת המוצר | מבין מה בונים: עבר על הפרוטוטייפ וכתב PRD במילים שלו | docs/PRD.md |
| 1 - v0.1 שלד ופרויקטים | משתמש רואה רשימת פרויקטים ומנווט לפרויקט (על mock) | ADR-001 בחירת מבנה ה-monorepo |
| 2 - v0.2 ממשק מלא על mock | כל מסכי המוצר נראים ועובדים כמו בפרוטוטייפ, עדיין על mock | צילומי מסך: הפרוטוטייפ מול הגרסה שלו |
| 3 - v0.3 שרת ונתונים | API אמיתי לפרויקטים ואתרים עם DB, הרשאות וטסטים | ERD + Swagger + ADR-002 מבנה מודולים |
| 4 - v0.4 מוצר מחובר | הלקוח עובד מול השרת האמיתי: יוצר, עורך ומוחק אתרים | תרשים זרימת נתונים + ADR-003 ניהול server state |
| 5 - v0.5 המפה | האתרים על המפה, בחירה מסונכרנת ויצירת אתר מהמפה | ADR-004 שילוב MapLibre ב-React + מדידת ביצועים |
| 6 - v0.6 חישובי כיסוי | מריצים חישוב כיסוי, רואים סטטוס חי, שכבת תוצאות והשוואה | ADR-005 ניהול משימות ארוכות |
| 7 - v1.0 שחרור | מוצר v1.0 בדוק, מתועד, רץ ב-Docker ומוצג לצוות | README, retro.md, הקלטת דמו |

## משימות

המעקב השוטף: Issues ו-Milestones בריפו הזה (Milestone לכל גרסה, Issue לכל משימה). סוגרים Issue רק אחרי אישור ראש הצוות.

### שבוע 0 - הכרת המוצר
**יעד:** מבין מה בונים: עבר על הפרוטוטייפ וכתב PRD במילים שלו  
**לתיק:** docs/PRD.md

- [ ] **#1** (הכנה) הרשאות, ריפו חדש galey-onboarding ו-CI ריק שרץ  
  לומד: Git, CI · Done: pipeline ירוק על commit ראשון
- [ ] **#2** (מוצר) Walkthrough של הפרוטוטייפ עם ראש הצוות (45 דק') – כל מסך, למה הוא קיים  
  לומד: הבנת דומיין · Done: רשימת שאלות פתוחות
- [ ] **#3** (מוצר) כתיבת PRD קצר במילים שלו: משתמשים, מסכים, ישויות (Project, Site, CalcTask), מחוץ לתחום  
  לומד: חשיבת מוצר · Done: docs/PRD.md מאושר
- [ ] **#4** (תהליך) פירוק ה-PRD לסטוריז בלוח המשימות לפי 7 הגרסאות  
  לומד: תכנון · Done: בקלוג מסודר לפי גרסאות

### שבוע 1 - v0.1 שלד ופרויקטים
**יעד:** משתמש רואה רשימת פרויקטים ומנווט לפרויקט (על mock)  
**לתיק:** ADR-001 בחירת מבנה ה-monorepo

- [ ] **#5** (סביבה) Monorepo: apps/client (Vite + React 19 + TS strict), apps/server (NestJS 12 ריק), packages/shared, ESLint/Prettier  
  לומד: כלים, TS config · Done: npm run dev מרים client ו-server
- [ ] **#6** (TypeScript) packages/shared: טיפוסי Project, Site, CalcTask, CalcResult ו-DTOs משותפים לפי ה-PRD  
  לומד: types, unions, generics · Done: שני ה-apps מייבאים את אותם טיפוסים
- [ ] **#7** (React) סטורי: 'כמשתמש אני רואה את רשימת הפרויקטים ומחפש' – קומפוננטות, state, useProjectsFilter על mock  
  לומד: React 19 hooks · Done: רשימה + חיפוש עובדים
- [ ] **#8** (React) סטורי: 'לחיצה על פרויקט פותחת את דף הפרויקט' – React Router, layout בסיסי  
  לומד: Routing · Done: ניווט רשימה ← פרויקט
- [ ] **#9** (שחרור) PR לכל סטורי + tag v0.1 + CHANGELOG + דמו 10 דק' מול הפרוטוטייפ  
  לומד: Git flow, PR · Done: v0.1 מתויג, דמו בוצע

### שבוע 2 - v0.2 ממשק מלא על mock
**יעד:** כל מסכי המוצר נראים ועובדים כמו בפרוטוטייפ, עדיין על mock  
**לתיק:** צילומי מסך: הפרוטוטייפ מול הגרסה שלו

- [ ] **#10** (MUI) Theme בהשראת הפרוטוטייפ (צבעי גלי ישראל) + RTL מלא  
  לומד: createTheme, RTL · Done: כל האפליקציה RTL תקין
- [ ] **#11** (MUI) מעטפת: AppBar עם לוגו, Drawer, Breadcrumbs – כמו בפרוטוטייפ  
  לומד: Layout, sx/styled · Done: מעטפת זהה לפרוטוטייפ
- [ ] **#12** (MUI) סטורי: 'אני רואה את אתרי הפרויקט בטבלה, ממיין ומסנן' – DataGrid  
  לומד: MUI X DataGrid · Done: טבלת אתרים על mock
- [ ] **#13** (MUI) סטורי: 'אני יוצר ועורך אתר בטופס עם ולידציה' – Dialog וטופס  
  לומד: טפסים, נגישות · Done: יצירה ועריכה על mock
- [ ] **#14** (MUI) מצבי loading / empty / error ו-Snackbar בכל מסך  
  לומד: UX states · Done: 3 מצבים בכל מסך
- [ ] **#15** (שחרור) tag v0.2 + CHANGELOG + צילומי מסך מול הפרוטוטייפ לתיק  
  לומד: תיעוד · Done: v0.2 מתויג

### שבוע 3 - v0.3 שרת ונתונים
**יעד:** API אמיתי לפרויקטים ואתרים עם DB, הרשאות וטסטים  
**לתיק:** ERD + Swagger + ADR-002 מבנה מודולים

- [ ] **#16** (PostgreSQL) תכנון סכמה מה-PRD: projects, sites, users + אינדקסים ו-constraints, ERD בתיק  
  לומד: תכנון סכמה · Done: ERD מאושר
- [ ] **#17** (TypeORM) Entities, relations, migration ראשון ו-seed של 150 אתרים (כמו ב-mock)  
  לומד: TypeORM, migrations · Done: DB נקי עולה עם נתונים
- [ ] **#18** (NestJS) מודולים Projects ו-Sites: controllers, services, DTOs מ-shared, ולידציה  
  לומד: DI, pipes · Done: CRUD מלא ב-Swagger
- [ ] **#19** (NestJS) Pagination, מיון וחיפוש בשרת (בדיוק מה שהטבלה צריכה) + Exception filter  
  לומד: QueryBuilder · Done: GET /sites?page&sort&search
- [ ] **#20** (NestJS) Auth: login עם JWT + Guard על כל ה-endpoints  
  לומד: Guards, JWT · Done: בקשה בלי token = 401
- [ ] **#21** (Testing) Unit לשירותים + e2e ל-CRUD של sites ב-CI  
  לומד: Jest/Vitest, supertest · Done: טסטים ירוקים ב-CI
- [ ] **#22** (שחרור) tag v0.3 + ADR-002 + דמו API בסוואגר  
  לומד: תיעוד · Done: v0.3 מתויג

### שבוע 4 - v0.4 מוצר מחובר
**יעד:** הלקוח עובד מול השרת האמיתי: יוצר, עורך ומוחק אתרים  
**לתיק:** תרשים זרימת נתונים + ADR-003 ניהול server state

- [ ] **#23** (Axios) api-client: instance, interceptor ל-token, נרמול שגיאות, טיפוסים מ-shared  
  לומד: Axios · Done: אין fetch ישיר בקוד
- [ ] **#24** (React Query) החלפת ה-mock: query key factory + queryOptions לפרויקטים ואתרים  
  לומד: TanStack Query v5 · Done: כל המסכים על השרת
- [ ] **#25** (React Query) סטורי: יצירה/עריכה/מחיקה של אתר מתעדכנים מיד – mutations + invalidation  
  לומד: Mutations · Done: בלי רענון דף
- [ ] **#26** (React Query) מחיקה אופטימית עם rollback + pagination צד שרת בטבלה  
  לומד: Optimistic updates · Done: מחיקה מיידית, חוזרת בשגיאה
- [ ] **#27** (React) מסך login, שמירת session ו-redirect ב-401  
  לומד: Auth flow · Done: כניסה ויציאה עובדות
- [ ] **#28** (שחרור) tag v0.4 + תרשים זרימת נתונים + ADR-003  
  לומד: תיעוד · Done: v0.4 מתויג, המוצר מחובר

### שבוע 5 - v0.5 המפה
**יעד:** האתרים על המפה, בחירה מסונכרנת ויצירת אתר מהמפה  
**לתיק:** ADR-004 שילוב MapLibre ב-React + מדידת ביצועים

- [ ] **#29** (MapLibre) מפה בדף הפרויקט (MapLibre GL JS v6, ESM + worker) לצד הטבלה – split view  
  לומד: MapLibre v6 · Done: מפה עם רקע
- [ ] **#30** (MapLibre) שכבת אתרים מ-GeoJSON מתוך React Query, צבע לפי סוג (expressions)  
  לומד: Sources, layers · Done: כל האתרים על המפה
- [ ] **#31** (MapLibre) סטורי: 'בחירה בטבלה מדגישה במפה ולהפך' – feature-state, Popup, flyTo  
  לומד: Events, feature-state · Done: סנכרון דו-כיווני
- [ ] **#32** (MapLibre) סטורי: 'לחיצה על המפה פותחת טופס אתר חדש עם הקואורדינטות'  
  לומד: Map events + MUI · Done: אתר נוצר מהמפה ונשמר בשרת
- [ ] **#33** (MapLibre) פאנל שכבות + LayerRegistry + fitBounds; ביצועים עם 20K אתרים (clustering, setData)  
  לומד: LayerRegistry, ביצועים · Done: מפה חלקה עם 20K
- [ ] **#34** (שחרור) tag v0.5 + ADR-004 + מדידת ביצועים לפני/אחרי  
  לומד: תיעוד · Done: v0.5 מתויג

### שבוע 6 - v0.6 חישובי כיסוי
**יעד:** מריצים חישוב כיסוי, רואים סטטוס חי, שכבת תוצאות והשוואה  
**לתיק:** ADR-005 ניהול משימות ארוכות

- [ ] **#35** (NestJS) CalcTask: POST /tasks מתחיל חישוב כיסוי ברקע, סטטוסים queued/running/done/failed + progress  
  לומד: Async jobs · Done: taskId חוזר מיד
- [ ] **#36** (PostgreSQL) טבלאות calc_tasks ו-calc_results, שמירת פוליגונים ב-JSONB בטרנזקציה  
  לומד: JSONB, transactions · Done: תוצאות נשמרות
- [ ] **#37** (React Query) סטורי: 'אני רואה את התקדמות החישוב חי' – refetchInterval שנעצר בסיום  
  לומד: Polling · Done: סטטוס חי
- [ ] **#38** (MapLibre) שכבת תוצאות (fill + outline) נרשמת ב-LayerRegistry כשמשימה מסתיימת  
  לומד: Fill layers · Done: כיסוי מוצג במפה
- [ ] **#39** (MUI) סטורי: 'אני משווה שתי ריצות' – שתי שכבות בצבעים + טבלת הבדלים  
  לומד: UX · Done: השוואה כמו בפרוטוטייפ
- [ ] **#40** (שחרור) tag v0.6 + ADR-005  
  לומד: תיעוד · Done: v0.6 מתויג

### שבוע 7 - v1.0 שחרור
**יעד:** מוצר v1.0 בדוק, מתועד, רץ ב-Docker ומוצג לצוות  
**לתיק:** README, retro.md, הקלטת דמו

- [ ] **#41** (Testing) טסטים ל-3 זרימות לקוח (Testing Library) + e2e לחישוב  
  לומד: Testing · Done: כיסוי לזרימות העיקריות
- [ ] **#42** (איכות) עבור איכות: אפס any, שגיאות, נגישות, RTL, Profiler; Code review מלא של ראש הצוות  
  לומד: Code quality · Done: כל הערות ה-review סגורות
- [ ] **#43** (DevOps) Dockerfile ל-client ו-server + docker compose להרצה מלאה בפקודה אחת  
  לומד: Docker · Done: מישהו אחר מריץ מה-README
- [ ] **#44** (שחרור) tag v1.0 + README + דמו לצוות (20 דק') + retro.md  
  לומד: הצגה · Done: v1.0 שוחרר
- [ ] **#45** (הערכה) הערכת סיום: מטריצת מיומנויות, יעדים לחודשיים, שיבוץ למשימת ספרינט בגלי ישראל  
  לומד: משוב · Done: משימה ראשונה בצוות

## סטטוסים
לא התחיל → בתהליך → בבדיקת קוד → הושלם (אחרי אישור). חסום = מסמנים מיד ומעדכנים את ראש הצוות.
