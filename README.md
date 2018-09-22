# DeviceAccess Angular Frontend

## Описание работы приложения
### Введение
Приложение обменивается структурами данных с сервером посредством REST API отправляя JSON рапросы к серверу. Описание структуры данных авторизации и списка проектов находятся в файле **src/app/user.ts**, а структуры данных проекта в файле **src/app/house/house.ts**. Для _POST_ запросов, должен передаваться _CSRF_ токен в заголовке **X-CSRFToken** получаемый из _Cookie_ **csrftoken**.

#### Список путей URL REST API и возвращаемые структуры данных:
##### Авторизация
- /api/auth/ -> User
- /api/refresh/
- /api/verify/

##### Список проектов
- /api/v1/house/ -> PaginatorApi<House>
  
##### Работа с проектом
- /api/v1/detail/ -> HouseDetail
- /api/v1/events/ -> PaginatorApi<EventLog>
- /api/v1/logs/ -> PaginatorApi<Logs>
- /api/v1/sections/ -> ?
- /api/v1/code/ -> Codes

### Авторизация
Пользователь заходит на сайт и попадает на страницу авторизации (компонент страницы **src/app/login**). Приложение посылает логин и пароль на **/api/auth/** и в ответ получает структуру **User** c описанием данных пользователя, его разрешений и ключ сессии.

### Запрос списка проектов
Пользователь заходит на страницу _Панель (/src/app/houses/dashboard/)_ или _Проекты (/src/app/houses/list/)_. Приложение запрашивает список проектов пользователя посылая _GET_ запрос на **/api/v1/house/** с указанием параметров для **PaginatorApi** например: "?**limit**=10&**offset**=0&**ordering**=title" запрос 10 проектов начиная с 0 отсортировать по "title". Также пользователь может воспользоваться _Поиском (/src/app/houses/search/)_ приложение при этом передаёт параметр _?**search**=текст_.

### Выбор проекта
Пользователь нажимает на имя проекта с которым будет работать и приложение запрашивает описание проекта посылая _GET_ запрос на **/api/v1/detail/?id=10** где 10 это ID выбранного проекта. В ответ приложение получает структуру **HouseDetail** и обрабатывает её. Тут описание структуры HouseDetail.

### Установка постоянного соединения с сервером
После этого подключается к _WebSocket_ и авторизуется передав ключ сессии полученный при авторизации на web сервере. Затем запрашивается состояние подключения проекта (**Cmd.ConnectInfo**).

## Cтруктуры данных
### Файл src/app/house/house.ts
Содержит описание структур данных. Тут описание всех структур.

## Протокол побщения по WebSocket
Приложение обменивается с WebSocket сервером сообщениями в виде массивов байт. Стразу после установки соединения сервер посылает один байт **Cmd.Auth**(1) на что клиент отвечает ключом сессии. В случае успешной авторизации сервер возврашает один байт **Cmd.Welcome**(2).
### Структура сообщения
Кроме Auth и Welcome структура следующая: 
[1 байт CMD][4 байта PROJECT_ID][ТЕЛО ЗАПРОСА]

---

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
-
