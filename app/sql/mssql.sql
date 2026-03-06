/*
  Scripts to create the database and objects for the Agent Referral System.
  Run this script against SQL Server (e.g. in Docker) to set up the schema.

  How to run (with SQL Server in Docker):
  1. Ensure the container is running: docker compose up -d
  2. From the project root, copy the script into the container and run it:
     docker cp app/sql/mssql.sql at-challenge-sqlserver-1:/tmp/mssql.sql
     docker exec -it at-challenge-sqlserver-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'ATChal1enge!' -C -d master -i /tmp/mssql.sql
     (If sqlcmd is not in that path, install Azure Data Studio and connect to localhost,1433 — user: sa, password: ATChal1enge! — then open and run this file.)
  3. The API is already configured to use Database=ReferralDb (see appsettings.json).
*/

-- Create database (run in context of 'master')
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'ReferralDb')
BEGIN
  CREATE DATABASE ReferralDb;
END
GO

USE ReferralDb;
GO

-- Agents table: users of the system and referral hierarchy
-- ReferredById self-reference builds the referral tree
IF OBJECT_ID(N'dbo.Agents', N'U') IS NOT NULL
  DROP TABLE dbo.Agents;
GO

CREATE TABLE dbo.Agents (
  Id           INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  Username     NVARCHAR(100) NOT NULL,
  PasswordHash NVARCHAR(256) NOT NULL,
  FirstName    NVARCHAR(100) NOT NULL,
  LastName     NVARCHAR(100) NOT NULL,
  Phone        NVARCHAR(50)  NULL,
  Status       NVARCHAR(20)  NOT NULL DEFAULT N'inactive',  -- 'active' | 'inactive' | 'deleted' (borrado lógico, reactivable)
  ReferredById INT NULL,
  CreatedAt    DATETIME2(2)  NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_Agents_Username UNIQUE (Username),
  CONSTRAINT FK_Agents_ReferredBy FOREIGN KEY (ReferredById) REFERENCES dbo.Agents(Id)
);
GO

-- Index for listing referrals by parent (tree / hierarchy queries)
CREATE NONCLUSTERED INDEX IX_Agents_ReferredById ON dbo.Agents (ReferredById);
GO

-- Seed users for development (password is 'password'; hash is SHA2_256)
-- Backend must hash login password with SHA256 and compare to PasswordHash
DECLARE @pwdHash NVARCHAR(64) = CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', N'password'), 2);

INSERT INTO dbo.Agents (Username, PasswordHash, FirstName, LastName, Phone, Status, ReferredById)
VALUES
  (N'tony',  @pwdHash, N'Tony',     N'Reichert', N'+599123123123', N'inactive', NULL),
  (N'john',  @pwdHash, N'John',     N'Doe',      N'+599123123123', N'inactive', NULL);
GO

-- Optional: add referrals under Tony (Juan and Felipe) to demo the tree
INSERT INTO dbo.Agents (Username, PasswordHash, FirstName, LastName, Phone, Status, ReferredById)
SELECT N'juan',   CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', N'password'), 2), N'Juan',   N'Perez',   N'+519123123123', N'active',   Id FROM dbo.Agents WHERE Username = N'tony'
UNION ALL
SELECT N'felipe', CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', N'password'), 2), N'Felipe', N'Paredes', N'+519123123123', N'inactive', Id FROM dbo.Agents WHERE Username = N'tony';
GO

-- Migración: si existía columna IsDeleted, pasar a Status='deleted' y quitar columna (ejecutar en ReferralDb si aplica)
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Agents') AND name = N'IsDeleted')
BEGIN
  UPDATE dbo.Agents SET Status = N'deleted' WHERE IsDeleted = 1;
  ALTER TABLE dbo.Agents DROP COLUMN IsDeleted;
END
GO

USE ReferralDb;
SELECT * FROM dbo.Agents;
