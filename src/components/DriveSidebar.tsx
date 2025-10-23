import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { RefreshCw, Upload, File, Loader2 } from "lucide-react";

interface DriveFile {
  id: string;
  name: string;
}

export const DriveSidebar = () => {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch("/api/drive/files");
      if (!response.ok) throw new Error("Erro ao buscar arquivos");
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      toast.error("Erro ao carregar arquivos do Drive");
      console.error(error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Clear cache
      const clearResponse = await fetch("/api/cache/clear", {
        method: "POST",
      });
      
      if (!clearResponse.ok) throw new Error("Erro ao limpar cache");
      
      toast.success("Cache limpo com sucesso");
      
      // Refetch files
      await fetchFiles();
    } catch (error) {
      toast.error("Erro ao atualizar lista");
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao fazer upload");

      const data = await response.json();
      toast.success(data.message || "Arquivo enviado com sucesso!");
      
      // Refetch files after successful upload
      await fetchFiles();
    } catch (error) {
      toast.error("Erro ao enviar arquivo");
      console.error(error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Card className="h-full flex flex-col border-l border-border/50 bg-card/50 backdrop-blur-sm rounded-none animate-fade-in">
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold text-lg mb-3">Arquivos no Drive</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex-1 hover:bg-primary/10 hover:border-primary transition-all"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Atualizar
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            size="sm"
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isLoadingFiles ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <File className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum arquivo encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-3 rounded-lg bg-secondary/50 border border-border/30 hover:bg-secondary hover:border-border transition-all duration-200 group"
              >
                <div className="flex items-start gap-2">
                  <File className="w-4 h-4 mt-0.5 text-primary group-hover:scale-110 transition-transform" />
                  <p className="text-sm flex-1 line-clamp-2">{file.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};
