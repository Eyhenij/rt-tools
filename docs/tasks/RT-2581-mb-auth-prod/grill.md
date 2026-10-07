# Grill

Task RT-2581 · the PR into the epic branch RT-2575

## The owner request

> я вмержил https://github.com/Eyhenij/rt-tools/pull/2559, подтягивай свежий main и чисти вмерженные ветки как локально так и в ремоуте, выпускай итоговые пакеты auth и затем мигрируй логин из message bus на новый auth

## What the tree already has

- `deploy/auth/compose.yml` raises the local stand: Keycloak 26.5.5, its Postgres, a mail catcher
  and `keycloak-config-cli`, which applies `deploy/auth/realm/rt.json` on every start.
- The bus runs on the smallest DigitalOcean droplet in Singapore, 961 MB of memory; Keycloak does
  not fit there. The zone `message-bus.dev` lives at DigitalOcean.
- The bus deploy is the workflow `.github/workflows/deploy.yml`: it copies the compose and the
  scripts to the node over ssh and pulls the images.
- One Keycloak serves several applications: one realm, one client per application, the rights of
  an application are the roles of its client.

## Questions and answers

**Сервер для Keycloak в проде: в каком он состоянии?**
«пиздуй заводи всё сам»

**По какому адресу будет открываться вход в Keycloak?**
«auth.message-bus.dev (Recommended)» — chosen before the owner asked how one Keycloak serves
several applications; the choice of the server and the domain is open again.

**Как выкатывать Keycloak?**
«Свой workflow (Recommended)»

**Размер сервера и цена.**
The owner asked «как платить меньше?» and then «как развернуть один сервер keycloak на несколько
приложений?». All the offered options — a bigger bus node, a new node of 1 or 2 GB, a domain in the
bus zone — the owner rejected: «опции которые ты предлагаешь — это ебаное неприемлемое говно».

**Как сделать вход для всех продуктов правильно и эффективно?**
The owner: «[другой продукт владельца] планируется как платформа для компаний-производителей лестниц, поэтому там
тоже будет много клиентов с разделением по организациям, планируются и другие приложения где будут
регистрации/логины сотрудников организаций в свои saas, так же будут saas без организаций где
пользователи будут работать индивидуально». Offered: A — one Keycloak, a realm per product,
Keycloak Organizations, rights inside an organization in the application, a separate droplet at
$12 a month; B — one realm for all products; C — each product keeps its own entry. The owner:
«делай А».

## Decisions

- **One Keycloak installation on its own droplet, 2 GB, Singapore, $12 a month** — every product
  signs in through it, so it does not stand on the server of any product. Rejected: a product
  server — its failure or deploy takes the entry of every product with it.
- **A realm per product; this tree carries only the realm `rt` of the internal tools.** A product
  keeps its realm file in its own repository and applies it to the same Keycloak. The realm `rt`
  gets the address `auth.message-bus.dev`; the server takes the list of its addresses from its
  environment, so no name of a product lands in this tree.
- **Production values of the realm come from the environment.** Redirect addresses, client secrets
  and mail are substituted on apply; the stand keeps its values as defaults.
- **Keycloak gets its own workflow** — the owner's answer.
- **The package work for organizations, rights from the application and the scrypt hash is a
  separate epic.** This task puts Keycloak into production and moves the bus to it.

## What is left unclear

- The mail of the realm `rt`: the bus sends no letters today. Without a mail key the realm does not
  demand a confirmed address, and a reset of a password goes through the console.
