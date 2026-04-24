# website
Skärmjakten websida

## Netlify
[![Netlify Status](https://api.netlify.com/api/v1/badges/a9c5b313-37fa-4906-96ba-bb935056fa92/deploy-status)](https://app.netlify.com/sites/skarmjakten/deploys)

Sidan hostas via Netlify

## Admin – Uppladdning av resultat

Sidan har ett administratörsgränssnitt på `/admin/` som gör det möjligt att
ladda upp resultat- och mellantiderfiler direkt från webbläsaren via GitHub OAuth.
Filerna committeras automatiskt till rätt plats i repot (`resultat/YEAR/NN_res.html`
resp. `resultat/YEAR/NN_mel.html`).

### Konfiguration (engångssetup)

#### 1. Skapa en GitHub OAuth App

1. Gå till **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Fyll i:
   - **Application name**: `Skärmjakten Admin` (eller valfritt namn)
   - **Homepage URL**: `https://skarmjakten.fi`
   - **Authorization callback URL**: `https://skarmjakten.fi/api/github-oauth`
3. Klicka **Register application**.
4. Notera **Client ID** och generera ett **Client Secret**.

#### 2. Lägg till miljövariabler i Netlify

I Netlify-dashboardens **Site settings → Environment variables**, lägg till:

| Variabel               | Värde                               |
|------------------------|-------------------------------------|
| `GITHUB_CLIENT_ID`     | Client ID från OAuth-appen ovan     |
| `GITHUB_CLIENT_SECRET` | Client Secret från OAuth-appen ovan |

#### 3. Behörighet

Alla GitHub-användare som är registrerade som **collaborators** (med push-rättigheter)
till repot `Skarmjakten/website` kan logga in och ladda upp resultat.
Övriga nekas åtkomst direkt i gränssnittet.
