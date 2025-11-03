import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, Download, FileText } from 'lucide-react';
import QRCode from 'qrcode';
import { getNextDrawDate, formatDrawDate, getDrawSchedule } from '@/lib/drawDates';

interface PrintTicketProps {
  betId: string;
  autoOpen?: boolean;
}

export default function PrintTicket({ betId, autoOpen = false }: PrintTicketProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isOpen, setIsOpen] = useState(autoOpen);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['/api/bets', betId, 'ticket'],
    queryFn: async () => {
      const response = await fetch(`/api/bets/${betId}/ticket`);
      if (!response.ok) throw new Error('Failed to fetch ticket');
      return await response.json();
    },
    enabled: !!betId,
  });

  useEffect(() => {
    if (ticket?.ticketId) {
      const shortCode = ticket.ticketId.slice(0, 8).toUpperCase();
      const qrData = `AFRIBET-${shortCode}`;
      
      QRCode.toDataURL(qrData, {
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('QR Code generation failed:', err));
    }
  }, [ticket]);

  const handlePrint = () => {
    const printContent = document.getElementById('ticket-content');
    if (!printContent) return;

    const printWindow = window.open('', '', 'height=800,width=400');
    if (!printWindow) return;

    const isPending = ticket.status === 'pending';
    
    printWindow.document.write('<html><head><title>AfriBet Ticket</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Arial', sans-serif; 
        padding: 10px;
        max-width: 380px;
        margin: 0 auto;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      .ticket { 
        border-radius: 16px;
        padding: 20px;
        background: white;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        page-break-inside: avoid;
      }
      .header { 
        text-align: center; 
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        padding: 16px;
        margin: -20px -20px 16px -20px;
        border-radius: 16px 16px 0 0;
      }
      .brand { 
        font-size: 24px; 
        font-weight: bold;
        letter-spacing: 2px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      }
      .subtitle { 
        font-size: 11px;
        margin-top: 6px;
        font-weight: 600;
        opacity: 0.95;
      }
      .qr-section {
        text-align: center;
        margin: 12px 0;
        padding: 16px;
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border-radius: 12px;
        border: 2px solid #22c55e;
      }
      .qr-code {
        width: 120px;
        height: 120px;
        margin: 0 auto;
        display: block;
        border: 3px solid white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      .qr-text {
        font-size: 10px;
        margin-top: 8px;
        font-weight: bold;
        color: #16a34a;
      }
      .authentic-badge {
        display: inline-block;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 9px;
        font-weight: bold;
        margin-top: 8px;
        box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
      }
      .section { 
        margin: 10px 0;
        padding: 8px 0;
        font-size: 13px;
      }
      .divider {
        height: 2px;
        background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
        margin: 12px 0;
      }
      .row { 
        display: flex; 
        justify-content: space-between; 
        margin: 6px 0;
        padding: 4px 0;
      }
      .label { 
        font-weight: 600;
        color: #64748b;
      }
      .value { 
        font-weight: bold;
        color: #1e293b;
      }
      .numbers-grid { 
        display: flex; 
        flex-wrap: wrap; 
        gap: 8px;
        justify-content: center;
        margin: 12px 0;
      }
      .number { 
        width: 44px; 
        height: 44px; 
        border: 3px solid #e2e8f0; 
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
      }
      .matched { 
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%) !important;
        color: white !important;
        border-color: #15803d !important;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4) !important;
        transform: scale(1.1);
      }
      .bonus { 
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%) !important; 
        color: white !important;
        border-color: #d97706 !important;
        box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4) !important;
      }
      .winning-number {
        background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%) !important;
        border-color: #818cf8 !important;
        color: #3730a3 !important;
      }
      .status-box {
        padding: 16px;
        text-align: center;
        margin: 12px 0;
        border-radius: 12px;
        font-weight: bold;
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      .won { 
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      }
      .lost { 
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      }
      .pending { 
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
      }
      .footer { 
        text-align: center; 
        font-size: 10px;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        padding: 12px;
        margin: 12px -20px -20px -20px;
        border-radius: 0 0 16px 16px;
        color: #475569;
      }
      .highlight { 
        background: linear-gradient(135deg, #fef08a 0%, #fde047 100%);
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: bold;
        box-shadow: 0 2px 6px rgba(253, 224, 71, 0.3);
      }
      .important-text {
        font-weight: bold;
        font-size: 14px;
        text-align: center;
        margin: 8px 0;
        color: #1e293b;
      }
      .barcode-sim {
        font-family: 'Libre Barcode 128', monospace;
        font-size: 32px;
        text-align: center;
        letter-spacing: -1px;
        margin: 4px 0;
      }
      @media print {
        body { padding: 0; }
        @page { 
          margin: 0.3cm; 
          size: 80mm auto;
        }
      }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  if (isLoading || !ticket) {
    return null;
  }

  const matchedNumbers = ticket.winning?.matchedNumbers || [];
  const selectedNums = ticket.selectedNumbers || [];
  const winningNums = ticket.result?.winningNumbers || [];
  const isPending = ticket.status === 'pending';
  const isWinner = ticket.status === 'won';
  const shortCode = ticket.ticketId.slice(0, 8).toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" data-testid="button-print-ticket">
          <FileText className="w-4 h-4 mr-2" />
          {isPending ? 'Print Betting Slip' : 'Print Results Ticket'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display flex items-center gap-2">
            {isPending ? (
              <>
                <FileText className="w-6 h-6 text-yellow-600" />
                Betting Slip Preview
              </>
            ) : (
              <>
                <FileText className="w-6 h-6 text-green-600" />
                Results Ticket Preview
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isPending 
              ? 'Review your bet details below. Click Print or Save PDF to keep a copy.' 
              : 'Your official results ticket. Print or save for your records.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4 border rounded-lg p-4 bg-muted/30">
          <div id="ticket-content" className="bg-white rounded-lg shadow-lg mx-auto p-5" style={{ maxWidth: '380px' }}>
            <div className="ticket">
            {/* Header */}
            <div className="header">
              <div className="brand">AFRIBET GAMES</div>
              <div className="subtitle">
                {isPending ? 'OFFICIAL BET SLIP' : 'RESULTS TICKET'}
              </div>
              <div className="subtitle" style={{ fontSize: '8px', marginTop: '2px' }}>
                {ticket.gameName.toUpperCase()}
              </div>
            </div>

            {/* Ticket ID & QR Code */}
            <div className="section">
              <div className="row">
                <span className="label">TICKET CODE:</span>
                <span className="value highlight" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                  {shortCode}
                </span>
              </div>
              <div className="row">
                <span className="label">Date/Time:</span>
                <span className="value" style={{ fontSize: '9px' }}>
                  {new Date(ticket.createdAt).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            <div className="divider"></div>

            {/* QR Code */}
            <div className="qr-section">
              {qrCodeUrl ? (
                <>
                  <div className="qr-text" style={{ marginBottom: '8px', fontSize: '11px' }}>
                    Scan to verify authenticity
                  </div>
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="qr-code"
                  />
                  <div className="authentic-badge">✓ AUTHENTIC TICKET</div>
                </>
              ) : (
                <div className="qr-text" style={{ padding: '20px', fontSize: '11px' }}>
                  Loading QR code...
                </div>
              )}
            </div>

            <div className="divider"></div>

            {/* Selected Numbers */}
            <div className="section">
              <div className="important-text">YOUR NUMBERS</div>
              <div className="numbers-grid">
                {selectedNums.map((num: number, idx: number) => {
                  const isMatched = matchedNumbers.includes(num);
                  return (
                    <div 
                      key={idx} 
                      className={`number ${!isPending && isMatched ? 'matched' : ''}`}
                    >
                      {num}
                    </div>
                  );
                })}
                {ticket.bonusNumber && (
                  <>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', alignSelf: 'center' }}>+</span>
                    <div className="number bonus">
                      {ticket.bonusNumber}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Winning Numbers (only show when results are available) */}
            {!isPending && ticket.result && ticket.result.winningNumbers && winningNums.length > 0 && (
              <>
                <div className="divider"></div>
                <div className="section">
                  <div className="important-text">WINNING NUMBERS</div>
                  <div className="numbers-grid">
                    {winningNums.map((num: number, idx: number) => (
                      <div key={idx} className="number winning-number">
                        {num}
                      </div>
                    ))}
                    {ticket.result.bonusNumber && (
                      <>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', alignSelf: 'center' }}>+</span>
                        <div className="number bonus">
                          {ticket.result.bonusNumber}
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '8px', marginTop: '4px' }}>
                    Draw: {new Date(ticket.result.drawDate).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="divider"></div>

            {/* Financial Info */}
            <div className="section">
              <div className="row">
                <span className="label">STAKE:</span>
                <span className="value" style={{ fontSize: '13px' }}>
                  ₦{ticket.stakeAmount.toLocaleString()}
                </span>
              </div>
              {isPending && ticket.potentialWinning && (
                <div className="row">
                  <span className="label">POTENTIAL WIN:</span>
                  <span className="value" style={{ fontSize: '13px' }}>
                    ₦{ticket.potentialWinning.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Status */}
            {isWinner && ticket.winning && (
              <>
                <div className="divider"></div>
                <div className="status-box won">
                  ★ WINNER! ★
                  <div style={{ fontSize: '14px', marginTop: '4px' }}>
                    ₦{ticket.winning.winningAmount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '9px', marginTop: '2px' }}>
                    {ticket.winning.matchedCount} NUMBERS MATCHED
                  </div>
                </div>
              </>
            )}

            {ticket.status === 'lost' && (
              <>
                <div className="divider"></div>
                <div className="status-box lost">
                  NOT A WINNER - PLAY AGAIN
                </div>
              </>
            )}

            {isPending && (
              <>
                <div className="divider"></div>
                <div className="status-box pending">
                  AWAITING RESULTS
                </div>
                <div className="section">
                  <div className="row">
                    <span className="label">Draw Schedule:</span>
                    <span className="value" style={{ fontSize: '10px' }}>
                      {getDrawSchedule(ticket.gameType)}
                    </span>
                  </div>
                  <div className="row">
                    <span className="label">Expected Draw:</span>
                    <span className="value" style={{ fontSize: '9px' }}>
                      {formatDrawDate(getNextDrawDate(ticket.gameType))}
                    </span>
                  </div>
                </div>
                <div className="important-text" style={{ fontSize: '9px', marginTop: '4px' }}>
                  KEEP THIS SLIP SAFE
                </div>
              </>
            )}

            {/* Barcode simulation */}
            <div className="barcode-sim">|||  ||||||  |||</div>
            <div style={{ textAlign: 'center', fontSize: '8px', marginBottom: '4px' }}>
              {shortCode}
            </div>

            <div className="divider"></div>

            {/* Footer */}
            <div className="footer">
              <div style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '9px' }}>
                THANK YOU FOR PLAYING
              </div>
              {isPending && (
                <div style={{ marginBottom: '2px' }}>
                  Present this slip to claim winnings
                </div>
              )}
              <div style={{ marginBottom: '2px' }}>
                Customer Service: www.afribet.com
              </div>
              <div style={{ fontSize: '7px', marginTop: '3px', fontStyle: 'italic' }}>
                Valid only with QR code • No duplicates accepted
              </div>
              <div style={{ fontSize: '7px', marginTop: '2px' }}>
                ID: {ticket.ticketId}
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            {isPending 
              ? 'Keep this betting slip safe. You\'ll need it to claim your winnings if you win.'
              : 'This ticket contains your official results. Save it for your records.'}
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handlePrint} 
              className="flex-1" 
              size="lg"
              data-testid="button-confirm-print"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Ticket
            </Button>
            <Button 
              onClick={handlePrint} 
              variant="outline"
              className="flex-1" 
              size="lg"
              data-testid="button-download-pdf"
            >
              <Download className="w-4 h-4 mr-2" />
              Save as PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
