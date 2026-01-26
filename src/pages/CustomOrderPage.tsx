import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Upload, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const MATERIALS = [
  { value: "ABS-M30", label: "ABS-M30 - Wytrzymały, odporny na temperatury" },
  { value: "ASA", label: "ASA - Odporny na UV, do zastosowań zewnętrznych" },
  { value: "PLA", label: "PLA - Ekologiczny, łatwy w obróbce" },
  { value: "TPU-92A", label: "TPU 92A - Elastyczny, gumopodobny" },
  { value: "SR-30", label: "SR-30 - Materiał podporowy (rozpuszczalny)" },
];

export default function CustomOrderPage() {
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [material, setMaterial] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const createOrder = useMutation(api.customOrders.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        const { storageId } = await result.json();
        setImages((prev) => [...prev, storageId]);
      }
      toast.success(`Dodano ${files.length} zdjęć`);
    } catch (error) {
      toast.error("Błąd podczas przesyłania zdjęć");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName || !description || !material) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    if (images.length === 0) {
      toast.error("Dodaj przynajmniej jedno zdjęcie projektu");
      return;
    }

    setSubmitting(true);
    try {
      await createOrder({
        projectName,
        description,
        material,
        images,
        contactInfo: contactInfo || undefined,
      });

      toast.success("Zamówienie wysłane! Skontaktujemy się z Tobą wkrótce.");
      navigate("/orders");
    } catch (error: any) {
      toast.error(error.message || "Błąd podczas wysyłania zamówienia");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Zamów Własny Projekt</h1>
            <p className="text-muted-foreground text-lg">
              Wydrukujemy Twój projekt na profesjonalnej drukarce Stratasys F170
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Informacje o drukarce</CardTitle>
              <CardDescription>
                Stratasys F170 - Profesjonalna drukarka FDM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>✓ Technologia FDM (Fused Deposition Modeling)</p>
              <p>✓ Obsługa rozpuszczalnych podpór (SR-30)</p>
              <p>✓ Wysoka precyzja i powtarzalność wydruków</p>
              <p>✓ Dostępne materiały: ABS-M30, ASA, PLA, TPU 92A</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Szczegóły projektu</CardTitle>
              <CardDescription>
                Wypełnij formularz, a my skontaktujemy się z wyceną
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Nazwa projektu *</Label>
                  <Input
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="np. Prototyp obudowy"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Opis projektu *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Opisz szczegółowo swój projekt, wymiary, wymagania..."
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="material">Materiał *</Label>
                  <Select value={material} onValueChange={setMaterial} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz materiał" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIALS.map((mat) => (
                        <SelectItem key={mat.value} value={mat.value}>
                          {mat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Dodatkowy kontakt (opcjonalnie)</Label>
                  <Input
                    id="contactInfo"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Telefon lub preferowany sposób kontaktu"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Zdjęcia projektu *</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {uploading ? (
                        <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-muted-foreground" />
                      ) : (
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      )}
                      <p className="text-sm text-muted-foreground">
                        Kliknij aby dodać zdjęcia (modele 3D, szkice, referencje)
                      </p>
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {images.map((imageId, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              Zdjęcie {index + 1}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wysyłanie...
                    </>
                  ) : (
                    "Wyślij zapytanie"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
