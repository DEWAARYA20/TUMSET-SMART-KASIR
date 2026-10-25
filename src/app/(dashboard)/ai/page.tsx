'use client';

import { useState } from 'react';
import {
  Bot,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Send,
  ShoppingBag,
  ArrowRight,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProductStore } from '@/lib/store/product-store';
import { useSalesStore } from '@/lib/store/sales-store';
import { formatCurrency } from '@/lib/format';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export default function KiosAiPage() {
  const { products } = useProductStore();
  const { sales } = useSalesStore();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Halo! Saya **TUMSET Kios AI**, asisten cerdas untuk kios sembako Anda. Saya dapat membantu menganalisis stok menipis, produk terlaris, margin laba harga jual, hingga saran waktu kulakan ke distributor.',
    },
  ]);

  // Compute live AI insights from products & sales data
  const lowStockItems = products.filter(
    (p) => p.current_stock > 0 && p.current_stock <= p.min_stock
  );
  const outOfStockItems = products.filter((p) => p.current_stock <= 0);

  // Highest margin products
  const highMarginItems = [...products]
    .map((p) => ({
      ...p,
      margin: ((p.selling_price - p.purchase_price) / p.selling_price) * 100,
    }))
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 3);

  function handleSendMessage(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const query = inputQuery.trim();
    if (!query) return;

    const userMsg: Message = { role: 'user', content: query };
    const lower = query.toLowerCase();

    let reply = '';

    if (lower.includes('stok') || lower.includes('habis') || lower.includes('kulakan')) {
      if (lowStockItems.length === 0 && outOfStockItems.length === 0) {
        reply = 'Berdasarkan data sistem saat ini, semua stok produk dalam batas aman di atas batas minimum. Belum ada barang yang perlu dibeli darurat hari ini.';
      } else {
        reply = `⚠️ **Rekomendasi Restock Segera:**\n`;
        if (outOfStockItems.length > 0) {
          reply += `- **Barang Habis (0):** ${outOfStockItems.map((p) => p.name).join(', ')}\n`;
        }
        if (lowStockItems.length > 0) {
          reply += `- **Stok Menipis:** ${lowStockItems.map((p) => `${p.name} (sisa ${p.current_stock} ${p.unit})`).join(', ')}\n`;
        }
        reply += `\nDisarankan segera order ke distributor grosir sebelum akhir pekan.`;
      }
    } else if (lower.includes('untung') || lower.includes('margin') || lower.includes('laba')) {
      reply = `💰 **3 Produk dengan Margin Keuntungan Tertinggi:**\n`;
      highMarginItems.forEach((p, idx) => {
        reply += `${idx + 1}. **${p.name}**: Margin ${p.margin.toFixed(1)}% (Beli: ${formatCurrency(p.purchase_price)}, Jual: ${formatCurrency(p.selling_price)})\n`;
      });
      reply += `\n💡 *Tips Kios AI:* Letakkan produk bermargin tinggi di etalase depan atau dekat meja kasir untuk memicu impulse buying pembeli!`;
    } else if (lower.includes('laris') || lower.includes('penjualan')) {
      reply = `📊 **Analisis Penjualan Kios:**\nTotal ${sales.length} transaksi penjualan telah tercatat. Produk kebutuhan pokok seperti Beras Ramos dan Minyak Bimoli merupakan produk dengan perputaran paling cepat. Pastikan modal selalu siap untuk menjaga ketersediaan barang-barang ini.`;
    } else {
      reply = `Saya telah memeriksa database toko Anda. Total saat ini ada **${products.length} produk** aktif dan **${sales.length} transaksi** penjualan. Anda dapat menanyakan:\n- *"Produk apa yang harus saya kulakan?"*\n- *"Berapa produk dengan margin tertinggi?"*\n- *"Bagaimana performa penjualan hari ini?"*`;
    }

    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: reply }]);
    setInputQuery('');
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Kios AI Assistant
              <Badge className="bg-primary/20 text-primary text-[10px] font-bold">
                Smart Engine
              </Badge>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Kecerdasan buatan untuk optimasi perputaran stok, margin laba, dan rekomendasi belanja grosir.
            </p>
          </div>
        </div>
      </div>

      {/* AI Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Restock Insight */}
        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-500 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Saran Restock Barang
            </span>
            <Badge variant="outline" className="text-[10px]">
              {lowStockItems.length + outOfStockItems.length} Produk
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {lowStockItems.length + outOfStockItems.length > 0
              ? `${lowStockItems[0]?.name || outOfStockItems[0]?.name} menipis. Segera hubungi distributor untuk menjaga stok.`
              : 'Semua inventaris barang aman di atas batas stok minimum.'}
          </p>
        </Card>

        {/* Margin Insight */}
        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Margin Unggulan
            </span>
            <Badge variant="outline" className="text-[10px]">
              +{highMarginItems[0]?.margin.toFixed(0)}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {highMarginItems[0]
              ? `${highMarginItems[0].name} memiliki margin profit tertinggi (${highMarginItems[0].margin.toFixed(0)}%).`
              : 'Data margin belum mencukupi.'}
          </p>
        </Card>

        {/* Fast Turnover */}
        <Card className="p-4 bg-card/60 backdrop-blur-sm border-border/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
              <Lightbulb className="h-4 w-4" />
              Peluang Bundling Kios
            </span>
            <Badge variant="outline" className="text-[10px]">
              Tips Cerdas
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Paket bundling "Indomie + Telur" atau "Kopi + Biskuit" efektif menaikkan rata-rata nilai belanja per pembeli.
          </p>
        </Card>
      </div>

      {/* Chat Interactive Area */}
      <Card className="flex flex-col h-[520px] overflow-hidden border-border/70">
        <CardHeader className="py-3 px-4 border-b bg-muted/30">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Tanya Kios AI Seputar Warung & Inventaris Anda
          </CardTitle>
        </CardHeader>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scrollbar-thin">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl max-w-xl leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground font-medium rounded-br-xs'
                    : 'bg-muted/60 text-foreground border border-border/60 rounded-bl-xs'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-4 py-2 border-t border-border/40 bg-card/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            Pertanyaan Populer:
          </span>
          {[
            'Barang apa yang perlu direstock?',
            'Produk mana yang paling untung?',
            'Bagaimana performa penjualan?',
          ].map((prompt, i) => (
            <Button
              key={i}
              type="button"
              variant="outline"
              size="sm"
              className="text-[11px] h-6 px-2.5 rounded-full shrink-0"
              onClick={() => {
                setInputQuery(prompt);
              }}
            >
              {prompt}
            </Button>
          ))}
        </div>

        {/* Query Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 border-t border-border bg-card flex items-center gap-2"
        >
          <Input
            placeholder="Ketik pertanyaan untuk Kios AI..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 text-xs h-10"
          />
          <Button type="submit" size="sm" className="h-10 px-4 gap-1.5 font-bold">
            <span>Kirim</span>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
