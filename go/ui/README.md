# Development
If you wonder how to run the project locally, this is the right place.

The project is built using [Vite](https://vitejs.dev/), which is a dependency manager.

## Prerequisites
- Node.js (v18.16.0)
- npm (v9.5.0)

## Setup
```bash
npm install
```

## Run
The shortest way to success is just to run the application locally and see if your changes work. Note what is written under the section on "Design".
```bash
npm run dev
```

## Build
This command will create a production build of the project in the `dist` folder.

The Go backend will serve the static files from this folder, which will be embedded in the executable.
```bash
npm run build
```

# Design
I use Blender for the scene. You could use theoretically any other 3D application like Maya or Cinema4D.

Export the scene as a glTF file, specifically as glp binary format, into the folder public/models. Please don't remove lights and camera, because they will be imported too into the three.js scene. Else they would missing and you're scene does not work anymore.

Check it with https://threejs.org/editor/, just drag and drop the glTF file into the editor. See if everything looks good. Note the the lights might be too strong. I already included a fix in the main.js during loading the scene.