# BuzzLine

<a href="https://buzzline.live" target="_blank">
    <img class="hero__main-img" src="https://github.com/jozef-hudec-27/buzzline-frontend/blob/main/app/opengraph-image.png?raw=true" alt="BuzzLine" />
</a>

<br>

BuzzLine is a real-time messaging and calling web application. Features include audio/video call, live messages and notifications, voice clip recording and more. Visit at [https://buzzline.live](https://buzzline.live).

<br>
<div>
<img class="hero__app-preview-photo" src="https://res.cloudinary.com/dsbky2fbe/image/upload/v1706466973/buzzline-register_tiicij.png" alt="Buzzline register page" width="500"/>

<img class="hero__app-preview-photo" src="https://res.cloudinary.com/dsbky2fbe/image/upload/v1709373061/buzzline-chat-2_xtw2mh.png" alt="Buzzline dashboard" width="500"/>

<img class="hero__app-preview-photo" src="https://res.cloudinary.com/dsbky2fbe/image/upload/v1709377232/buzzline-current-call_eo6yup.png" alt="Buzzline video call" width="500"/>
</div>
<br/>

## 🚀 BuzzLine Front End

This repo contains code for BuzzLine's front-end (back-end code can be found [here](https://github.com/jozef-hudec-27/buzzline-backend)). The framework used is Next.js 14, which makes sure the app's performance and SEO is out of this world!

### 🦾 Tech Stack

- [Next.js](https://nextjs.org/)
- [Zustand](https://github.com/pmndrs/zustand) (state management)
- [Axios](https://axios-http.com/docs/intro)
- [TanStack Query](https://tanstack.com/query/latest/)
- [Socket.IO](https://socket.io/)
- [Peer.js](https://peerjs.com)
- [Tailwind CSS](https://tailwindcss.com/)

### 🚄 Quick Start

In case you want to run the project locally, follow these instructions.

#### Prerequisites

Make sure you have the following installed on your machine:

- Git
- Node.js
- npm

#### Clone the repo

```
git clone git@github.com:jozef-hudec-27/buzzline-frontend.git
cd buzzline-frontend
```

#### Install dependencies

```
npm install
```

#### Set up environment variables

Create a file called `.env` in the root of the project and add the following:

```
NEXT_PUBLIC_BASE_URL=<YOUR SERVER URL>
CLOUD_HOSTNAME=<YOUR CLOUD PROVIDER URL>
```

Optionally, if you know what you're doing, you can add this variable:

```
NEXT_PUBLIC_PEER_OPTIONS=<DESIRED PEER OPTIONS>
```

in the format of a JSON string: `NEXT_PUBLIC_PEER_OPTIONS='{"host":"my-peer-server.com","port":443,"path":"/peer","secure":true,"config":{"iceServers":[{"urls":"stun:my.stun.com:80"},{"urls":"turn:my.turn.com:80","username":"87a45f1aef32b19d79c2a14e","credential":"YPqrxjSHfWJOLsJM"}]}}'`

#### Run the project

```
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) and voila!
