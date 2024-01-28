# BuzzLine

<div class="hero">
<a href="https://buzzline.live" target="_blank">
    <img class="hero__main-img" src="https://github.com/jozef-hudec-27/buzzline-frontend/blob/main/app/opengraph-image.png?raw=true" alt="BuzzLine" width="600" />
</a>

<p>BuzzLine is a real-time messaging web application. Features include live messages and notifications, voice clip recording, online status tracking and more. Visit at <a href="https://buzzline.live" target="_blank">https://buzzline.live</a>.</p>

<div class="hero__app-preview-photos">
<img class="hero__app-preview-photo" src="https://res.cloudinary.com/dsbky2fbe/image/upload/v1706466973/buzzline-register_tiicij.png" alt="Buzzline register page" width="375"/>

<img class="hero__app-preview-photo" src="https://res.cloudinary.com/dsbky2fbe/image/upload/v1706466973/buzzline-login_mqvazn.png" alt="Buzzline register page" width="375"/>

<img class="hero__app-preview-photo" src="https://res.cloudinary.com/dsbky2fbe/image/upload/v1706466974/buzzline-voice-clip_f1djp6.png" alt="Buzzline register page" width="375"/>

<img class="hero__app-preview-photo" src="https://res.cloudinary.com/dsbky2fbe/image/upload/v1706466974/buzzline-remove-msg_grxdkq.png" alt="Buzzline register page" width="375"/>
</div>
</div><br/>


## 🚀 BuzzLine Front End

This repo contains code for BuzzLine's front-end. The framework used is Next.js 14, which makes sure the app's performance and SEO is out of this world!

### 🦾 Tech Stack

- [Next.js](https://nextjs.org/)
- [Zustand](https://github.com/pmndrs/zustand) (state management)
- [Axios](https://axios-http.com/docs/intro)
- [TanStack Query](https://tanstack.com/query/latest/)
- [Socket.IO](https://socket.io/)
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

Create a file called ```.env``` in the root of the project and add the following:

```
NEXT_PUBLIC_BASE_URL=<YOUR SERVER URL>
CLOUD_HOSTNAME=<YOUR CLOUD PROVIDER URL>
```

#### Run the project

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and voila!




<style>
.hero {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
}

.hero__main-img {
    border-radius: 12px;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.1);
}

.hero__app-preview-photos {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
}

.hero__app-preview-photo {
    border-radius: 12px;
}
</style>
