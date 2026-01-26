import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Package, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function CustomOrderPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const createOrder = useMutation(api.customOrders.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [projectName, setProjectName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [material, setMaterial] = useState("");
  const [description, setDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [files3D, setFiles3D] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Zaloguj się, aby złożyć zamówienie niestandardowe</h1>
          <Button onClick={() => navigate("/auth")}>Zaloguj się</Button>
        </div>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleFiles3DChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles3D(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName || !customerName || !customerEmail || !material || !description) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images (optional)
      const imageIds: string[] = [];
      if (images.length > 0) {
        for (const image of images) {
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": image.type },
            body: image,
          });
          const { storageId } = await result.json();
          imageIds.push(storageId);
        }
      }

      // Upload 3D files (optional)
      const file3DIds: string[] = [];
      if (files3D.length > 0) {
        for (const file of files3D) {
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": file.type },
            body: file,
          });
          const { storageId } = await result.json();
          file3DIds.push(storageId);
        }
      }

      await createOrder({
        projectName,
        customerName,
        customerEmail,
        material,
        description,
        contactInfo: contactInfo || undefined,
        images: imageIds,
        files3D: file3DIds,
      });

      toast.success("Zamówienie zostało złożone! Skontaktujemy się wkrótce.");
      navigate("/orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Nie udało się złożyć zamówienia. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Zamówienie Niestandardowe
              </h1>
              <p className="text-muted-foreground text-lg">
                Idealne dla skomplikowanych prototypów wymagających najwyższej precyzji
              </p>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Szczegóły Projektu</CardTitle>
                <CardDescription>
                  Dzięki rozpuszczalnym podporom (SR-30) możemy tworzyć bardzo złożone geometrie i detale, 
                  które byłyby niemożliwe do wykonania tradycyjnymi metodami. Idealne dla prototypów funkcjonalnych 
                  i skomplikowanych projektów inżynierskich.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Nazwa Projektu *</Label>
                    <Input
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="np. Prototyp obudowy urządzenia"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Imię i Nazwisko *</Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Jan Kowalski"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="jan@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="material">Materiał *</Label>
                    <Select value={material} onValueChange={setMaterial} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz materiał" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ABS-M30">ABS-M30 (Wytrzymały, uniwersalny)</SelectItem>
                        <SelectItem value="ASA">ASA (Odporny na UV, zewnętrzny)</SelectItem>
                        <SelectItem value="TPU 92A">TPU 92A (Elastyczny, giętki)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Wszystkie projekty mogą wykorzystywać rozpuszczalne podpory SR-30 dla maksymalnej precyzji
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Opis Projektu *</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Opisz szczegółowo swój projekt, wymagania techniczne, wymiary, ilość sztuk..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactInfo">Dodatkowy Kontakt (opcjonalnie)</Label>
                    <Input
                      id="contactInfo"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="Numer telefonu lub preferowana forma kontaktu"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="images">Zdjęcia / Szkice (opcjonalnie)</Label>
                    <Label htmlFor="images" className="cursor-pointer block">
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <Input
                          id="images"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <span className="text-sm text-muted-foreground">
                          Kliknij, aby dodać zdjęcia lub szkice
                        </span>
                        {images.length > 0 && (
                          <p className="text-sm text-primary mt-2">
                            Wybrano {images.length} plik(ów)
                          </p>
                        )}
                      </div>
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="files3D">Pliki 3D (opcjonalnie)</Label>
                    <Label htmlFor="files3D" className="cursor-pointer block">
                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                        <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <Input
                          id="files3D"
                          type="file"
                          accept=".stl,.obj,.step,.stp,.iges,.igs,.3mf"
                          multiple
                          onChange={handleFiles3DChange}
                          className="hidden"
                        />
                        <span className="text-sm text-muted-foreground">
                          Kliknij, aby dodać pliki 3D (.stl, .obj, .step, .3mf)
                        </span>
                        {files3D.length > 0 && (
                          <p className="text-sm text-primary mt-2">
                            Wybrano {files3D.length} plik(ów) 3D
                          </p>
                        )}
                      </div>
                    </Label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Wysyłanie..." : "Złóż Zamówienie"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}