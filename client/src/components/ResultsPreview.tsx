import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Game, Result } from "@shared/schema";

export default function ResultsPreview() {
  const { data: games = [] } = useQuery<Game[]>({ queryKey: ["/api/games"] });
  const { data: results = [], isLoading } = useQuery<Result[]>({ queryKey: ["/api/results"] });
  const latest = results.slice(0, 3);
  const gameName = (gameId: string) => games.find((game) => game.id === gameId)?.name ?? "Game";

  return (
    <section id="results" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">Latest Results</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Published draw results from the official results service.
          </p>
        </div>

        {latest.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {latest.map((result) => {
              const numbers = JSON.parse(result.winningNumbers) as number[];
              return (
                <Card key={result.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display font-semibold text-lg">{gameName(result.gameId)}</h3>
                      <Badge variant="secondary">Published</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" aria-hidden="true" />
                      <span>{new Date(result.drawDate).toLocaleString("en-NG")}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {numbers.map((number) => (
                        <span key={number} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {number}
                        </span>
                      ))}
                      {result.bonusNumber !== null && (
                        <span className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold border-2 border-primary">
                          {result.bonusNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center mb-8 text-muted-foreground">
            {isLoading ? "Loading published results…" : "No official results have been published yet."}
          </Card>
        )}

        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/results">View All Results</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
