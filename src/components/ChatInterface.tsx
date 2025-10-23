import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Quais são os principais insights do último relatório?",
  "Como está o desempenho de vendas este mês?",
  "Analise as tendências de mercado recentes",
  "Quais produtos têm melhor performance?",
  "Mostre um resumo dos dados financeiros",
  "Identifique oportunidades de crescimento",
  "Compare os resultados com o trimestre anterior",
  "Quais são os principais desafios identificados?",
  "Analise o comportamento dos clientes",
  "Sugira melhorias baseadas nos dados",
  "Qual é a previsão para o próximo período?",
  "Mostre os indicadores-chave de desempenho",
];

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Select 3 random questions on mount
    const shuffled = [...SUGGESTED_QUESTIONS].sort(() => Math.random() - 0.5);
    setSuggestedQuestions(shuffled.slice(0, 3));
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) throw new Error("Erro ao enviar mensagem");

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || "Desculpe, não consegui processar sua solicitação.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInputMessage(question);
    handleSubmit(question);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Alpha Insights
              </h2>
              <p className="text-muted-foreground">
                Sua plataforma de análise inteligente está pronta
              </p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex animate-slide-up",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 transition-all duration-300 hover:shadow-lg",
                  message.role === "user"
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    : "bg-card border border-border/50"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-slide-up">
              <div className="bg-card border border-border/50 rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Suggested Questions */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 animate-fade-in">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(question)}
                  className="text-xs hover:bg-primary/10 hover:border-primary transition-all"
                >
                  {question}
                </Button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex gap-2"
          >
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1 bg-input border-border/50 focus:border-primary rounded-full px-6 transition-all"
            />
            <Button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-glow"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
