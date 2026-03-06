# AT-Challenge: estado del proyecto y pasos a seguir

Este documento resume lo que ya está implementado, las modificaciones realizadas y los pasos que faltan para cumplir todos los requisitos del [README.md](README.md).

---

## 1. Requisitos del README y estado actual

| # | Requisito | Estado | Notas |
|---|-----------|--------|--------|
| **1** | **Login**: obligatorio, usuario/contraseña, al ingresar actualizar status a "active" | ✅ Hecho | JWT, sessionStorage, redirección a /home |
| **2** | **Mostrar y gestionar referidos**: árbol en tabla/grid, jerarquía visible, navegable | ✅ Hecho | GET /api/agents (árbol), loader + tabla con indentación por nivel |
| **3** | **Añadir nuevos agentes**: en cualquier nivel, como referido de un agente existente | ✅ Hecho | POST /api/agents, modal conectado a home action |

Referencias de UI: **imagen1.png** (login), **imagen2.png** y **imagen3.png** (tabla/árbol), **imagen4.png** (modal New Agent), en la raíz del proyecto.

---

## 2. Modificaciones ya realizadas

### 2.1 Entorno y Docker

- **compose.yaml**
  - Puertos: `5001:5000` (API), `5173:5173` (UI); API en 5001 para evitar conflicto con AirPlay en Mac.
  - Variable de entorno `VITE_API_URL=http://127.0.0.1:5001/api` para que la UI llame a la API correcta.
  - `ASPNETCORE_URLS=http://0.0.0.0:5000` para que la API escuche en todas las interfaces dentro del contenedor.
  - `depends_on: sqlserver` en el servicio `app`.

- **DOCKER-INSTRUCTIVO.md**  
  Instructivo para levantar todo con Docker en Mac (Apple Silicon).

### 2.2 Base de datos

- **app/sql/mssql.sql**
  - Creación de base `ReferralDb` y tabla `Agents` (Id, Username, PasswordHash, FirstName, LastName, Phone, Status, ReferredById, **IsDeleted**, CreatedAt).
  - **IsDeleted** (BIT, default 0): borrado lógico; si un agente está eliminado no aparece en el listado pero sus referidos siguen visibles (como raíz).
  - Bloque opcional `ALTER TABLE` para añadir `IsDeleted` en bases ya existentes.
  - Índice en `ReferredById` para consultas de árbol.
  - Datos de prueba: tony, john (raíz); juan, felipe (referidos de Tony). Contraseña de prueba: **password** (hash SHA2_256 en SQL, UTF-16 para coincidir con C#).

- **app/net/appsettings.json** y **appsettings.Development.json**  
  - `ConnectionStrings:ReferralDb` apuntando a SQL Server en el servicio `sqlserver`.

### 2.3 Backend (.NET Core 2.1)

- **Autenticación JWT**
  - **net.csproj**: paquetes `Microsoft.AspNetCore.Authentication.JwtBearer` 2.1.2 y `System.IdentityModel.Tokens.Jwt` 5.2.0.
  - **appsettings.json**: sección `Jwt` (SecretKey, Issuer, Audience, ExpirationMinutes).
  - **Models/Agent.cs**: modelo para la tabla Agents.
  - **Repositories/IAuthRepository.cs**, **AuthRepository.cs**: `GetByUsername`, `SetStatusActive`.
  - **Services/IAuthService.cs**, **AuthService.cs**: validación de usuario/contraseña (hash SHA256 en UTF-16 para coincidir con SQL), actualización de status, generación de JWT.
  - **Controllers/AuthController.cs**: `POST /api/auth/login` (body: username, password); respuestas 401 con `StatusCode(401, new { message })` (compatible con .NET 2.1).
  - **Startup.cs**: `AddAuthentication(JwtBearer)`, `AddCors` con orígenes `http://localhost:5173` y `http://127.0.0.1:5173`; CORS antes de `UseMvc`; sin `UseHttpsRedirection` en Development para evitar fallos de preflight.

- **Conexión y escucha**
  - **Repositories/StatusRepository.cs**: usa `IConfiguration` y connection string `ReferralDb`.
  - **Properties/launchSettings.json**: `applicationUrl` del perfil "net" cambiado a `http://0.0.0.0:5000` para que la API sea accesible desde el host vía mapeo de puertos.

- **Contraseña**
  - En **AuthService.cs**, el hash del password se calcula con `Encoding.Unicode` (UTF-16 LE) para coincidir con `HASHBYTES('SHA2_256', N'...')` en SQL (NVARCHAR = UTF-16).

- **Requisito 2 – Árbol de referidos (backend)**
  - **Models/AgentTreeNode.cs**: DTO con Id, FullName, Username, Phone, Status, ReferredById, Referrals (lista recursiva).
  - **Repositories/IAgentsRepository.cs**, **AgentsRepository.cs**: `GetAll()` devuelve todos los agentes (con IsDeleted) para construir el árbol; `GetByUsername` solo no eliminados (login); `SoftDelete(id)` en lugar de DELETE físico.
  - **Controllers/AgentsController.cs**: `GET /api/agents` construye el árbol solo con agentes no eliminados; si el referidor está eliminado, el agente se muestra como raíz (no se pierde data).
  - Registro en **Startup.cs**: `IAgentsRepository`, `AgentsRepository`.

- **Borrado lógico (soft delete)**
  - **Models/Agent.cs**: propiedad `IsDeleted`.
  - **DELETE /api/agents/:id**: marca `IsDeleted = 1`; no exige que el agente no tenga referidos. Los referidos siguen en el listado (como raíz si su referidor está eliminado).
  - **Create / PATCH**: el referidor debe existir y no estar eliminado.

### 2.4 Frontend (React + TypeScript)

- **auth.ts**: `getToken`, `setToken`, `removeToken`, `isAuthenticated`, `authHeaders()` usando `sessionStorage`.
- **api.ts**: `apiGet(path)` con `Authorization: Bearer` para llamadas autenticadas.
- **constants.ts**: `URL_API` con fallback a `import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000/api"`.
- **vite-env.d.ts**: tipo `VITE_API_URL` para env.
- **pages/login/action.ts**: POST a `/api/auth/login`, guardar token, `redirect('/home')` o devolver error para mostrarlo en la UI.
- **pages/login/route.tsx**: `useActionData()` para mostrar mensaje de error de login.
- **pages/root/loader.tsx**: `isAuthenticated()` para redirigir a `/login` o `/home`.
- **router.tsx**: ruta índice con `Navigate` a `/home` o `/login` según autenticación.
- **pages/home/route.tsx**: logout con `removeToken()` y `navigate("/login", { replace: true })`.
- **models.ts**: tipo `AgentReferral` con id, fullName, username, phone, status, referredById, referrals, depth; tipo `AgentTreeNode` para respuesta del API.
- **Requisito 2 – Árbol de referidos (frontend)**
  - **api.ts**: clase `ApiError` con `status`; `apiGet` y `apiPost` con Bearer token.
  - **pages/home/loader.ts**: devuelve árbol `AgentTreeNode[]` directamente (sin aplanar).
  - **pages/home/referral-table.tsx**: tabla por raíz; bajo cada agente con referidos, **tabla anidada en marco** (borde izquierdo, mismo formato NAMES/USERNAME/PHONE/STATUS/ACTIONS).
- **Requisito 3 – Añadir agentes**
  - **Backend**: `Helpers/PasswordHashHelper.cs` (SHA256 UTF-16); `IAgentsRepository` + `AgentsRepository` con `GetByUsername`, `GetById`, `GetDescendantIds`, `Create`, `UpdateReferredById`; `AgentsController` `POST /api/agents` con validación de que el referidor exista; `PATCH /api/agents/:id` para cambiar referidor con validación anti-ciclos.
  - **Regla “no padre/descendiente”**: Un agente no puede tener como referidor a sí mismo ni a ninguno de sus descendientes (evitar ciclos: si Tony → Juan → Jose, Jose no puede tener a Juan ni a Tony como referidor). Se aplica al **actualizar** el referidor (PATCH). Al **crear** un agente nuevo no hay ciclo posible. **No hace falta modificar tablas SQL**: la regla se aplica en la API (repositorio `GetDescendantIds` con CTE recursivo, validación en el controller).
  - **Frontend**: `home/action.ts` lee formulario New Agent, valida password === confirmPassword, llama `apiPost('agents', ...)`; modal muestra error con `useActionData`; éxito → `redirect('/home')`.

---

## 3. Pasos a seguir para completar el README

### 3.1 Requisito 2: Mostrar y gestionar el árbol de referidos ✅ Implementado

**Backend (hecho)**

- **AgentsController** con `[Authorize]`: `GET /api/agents` devuelve árbol (raíz = sin referidor, cada nodo con `referrals`).
- **AgentsRepository** obtiene todos los agentes; el controller arma el árbol en memoria.
- JSON en camelCase para el frontend (configuración en Startup).

**Frontend (hecho)**

- **home/loader.ts**: llama a `apiGet('/agents')`, aplana el árbol con `depth` y devuelve la lista a la tabla; en 401 redirige a login.
- **referral-table.tsx**: columna NAMES con celda que indenta según `depth`.
- Botones Ver / Añadir referido / Eliminar siguen como placeholders; se pueden conectar más adelante (requisito 3 y opcionales).

Referencia visual: **imagen2.png**, **imagen3.png**.

---

### 3.2 Requisito 3: Añadir nuevos agentes ✅ Implementado

**Backend (hecho):** `POST /api/agents`, validación de username único, `PasswordHashHelper`, `Create` en repository.

**Frontend (hecho):** `home/action.ts` + modal con `useActionData` para errores; éxito → `redirect('/home')`.

**Detalle (referencia):**

1. En **AgentsController** (o el que uses para agentes):
   - `POST /api/agents`: body con FirstName, LastName, Phone, Username, Password y opcionalmente **referredById** (id del agente que refirió).
   - Validar que el username no exista en `Agents`.
   - Hashear la contraseña con el **mismo criterio** que en login: `Encoding.Unicode` + SHA256 + hex (para coincidir con SQL y con posibles nuevos inserts vía script).
   - Insertar en `Agents` con `ReferredById` si se envió.
   - Endpoint protegido con `[Authorize]`.

**Frontend**

1. En **home/action.ts**:
   - Detectar envío del formulario "New Agent" (p. ej. por `request.formData()` y presencia de campos como `firstName`, `username`).
   - Validar `password === confirmPassword`.
   - Llamar a `POST /api/agents` con los campos del formulario y, si el usuario eligió “añadir como referido de X”, incluir `referredById: idDelAgente`.
   - Tras éxito: `return redirect("/home")` o revalidar el loader para que la tabla se actualice.
2. En **add_referral_modal.tsx**:
   - Asegurar que los `name` de los inputs coincidan con lo que espera el action (firstName, lastName, phone, username, password, confirmPassword).
   - Opcional: si “Add” se abre desde una fila de la tabla, pasar el `id` del agente padre (p. ej. query param o state) para que el action envíe `referredById`.

Referencia visual: **imagen4.png** (modal New Agent con Personal Information y Access Details).

---

## 4. Resumen de archivos clave

| Área | Archivos |
|------|----------|
| **Docker** | `compose.yaml`, `DOCKER-INSTRUCTIVO.md` |
| **SQL** | `app/sql/mssql.sql` |
| **API config** | `app/net/appsettings.json`, `Properties/launchSettings.json` |
| **Auth backend** | `Controllers/AuthController.cs`, `Services/AuthService.cs`, `Repositories/AuthRepository.cs`, `Models/Agent.cs` |
| **Auth frontend** | `src/auth.ts`, `src/api.ts`, `pages/login/action.ts`, `pages/login/route.tsx`, `pages/root/loader.tsx`, `pages/home/route.tsx` (logout) |
| **GET/POST /api/agents** | `AgentsController`, `AgentsRepository` (GetAll, GetByUsername, Create), `PasswordHashHelper` |
| **Tabla con referidos en marco** | `referral-table.tsx` recibe árbol y renderiza sub-tabla por agente con referidos |
| **Alta de agente** | `home/action.ts` + `apiPost`, modal con `errorMessage` desde `useActionData` |

---

## 5. Cómo levantar todo (recordatorio)

```bash
# Desde la raíz del proyecto
docker compose up -d --build
```

Terminal 1 (API):

```bash
docker compose exec app bash -c "cd /app/app/net && dotnet run"
```

Terminal 2 (UI):

```bash
docker compose exec app bash -c "cd /app/app/ui && npm run dev -- --host 0.0.0.0"
```

- UI: http://127.0.0.1:5173  
- API: http://127.0.0.1:5001  
- Login de prueba: **tony** / **password**

Base de datos: ejecutar una vez `app/sql/mssql.sql` (p. ej. con Azure Data Studio a localhost:1433, sa / ATChal1enge!).

---

Con esto tienes el requisito 1 del README cumplido y una guía clara para implementar los requisitos 2 (árbol de referidos) y 3 (añadir agentes). Cuando implementes los endpoints y las pantallas, puedes ir actualizando este mismo documento con el estado de cada ítem.
