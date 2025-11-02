import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

export default function ResultsPreview() {
  //todo: remove mock functionality
  const mockResults = [
    {
      game: 'Virtual Betting',
      date: '2025-10-31',
      time: '14:30',
      numbers: [5, 12, 23, 31, 40],
    },
    {
      game: 'Main/Daily',
      date: '2025-10-31',
      time: '10:00',
      numbers: [7, 18, 34, 56, 72],
    },
    {
      game: 'Mid-Week',
      date: '2025-10-30',
      time: '22:45',
      numbers: [9, 25, 48, 67],
      bonus: 82,
    },
  ];

  return (
    <section id="results" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Latest Results
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Check the winning numbers from our most recent games. All results are verified and transparent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {mockResults.map((result, idx) => (
            <Card key={idx} className="p-6" data-testid={`result-card-${idx}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-lg">{result.game}</h3>
                  <Badge variant="secondary">Latest</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{result.date} at {result.time}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {result.numbers.map((num) => (
                    <div
                      key={num}
                      className="w-12 h-12 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-lg"
                      data-testid={`number-${num}`}
                    >
                      {num}
                    </div>
                  ))}
                  {result.bonus && (
                    <div
                      className="w-12 h-12 rounded-lg bg-chart-2/20 text-chart-2 font-bold flex items-center justify-center text-lg border-2 border-chart-2"
                      data-testid={`bonus-${result.bonus}`}
                    >
                      {result.bonus}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            data-testid="button-view-all-results"
          >
            View All Results
          </Button>
        </div>
      </div>
    </section>
  );
}
