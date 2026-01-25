import { Canvas } from "@react-three/fiber";
import { Stage, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ModelViewerProps {
  url: string;
}

function Model({ url }: { url: string }) {
  useEffect(() => {
    console.log("ModelViewer: Attempting to load 3D model from URL:", url);
  }, [url]);

  try {
    const { scene } = useGLTF(url);
    console.log("ModelViewer: 3D model loaded successfully");
    return <primitive object={scene} />;
  } catch (error) {
    console.error("ModelViewer: Error loading 3D model:", error);
    throw error;
  }
}

export function ModelViewer({ url }: ModelViewerProps) {
  if (!url || url.includes("placehold.co")) {
    console.warn("ModelViewer: Invalid or placeholder URL provided:", url);
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-xl">
        Model 3D niedostępny (brak URL)
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] bg-muted/20 rounded-xl overflow-hidden relative">
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Ładowanie modelu 3D...</span>
          </div>
        }
      >
        <Canvas shadows dpr={[1, 2]} camera={{ fov: 50 }} onError={(error) => {
          console.error("Canvas error:", error);
        }}>
          <Stage environment="city" intensity={0.6}>
            <Model url={url} />
          </Stage>
          <OrbitControls autoRotate />
        </Canvas>
      </Suspense>
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
        Interaktywny model 3D
      </div>
    </div>
  );
}