import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Lightbulb, 
  CheckCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  X,
  Bot,
  Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { aiInsights, aiChatResponses } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Area, ComposedChart
} from 'recharts';

const categoryConfig = {
  awareness: { icon: Lightbulb, label: 'Awareness Issue', color: 'bg-warning', bgColor: 'bg-warning/10' },
  performance: { icon: TrendingUp, label: 'Performance Gap', color: 'bg-info', bgColor: 'bg-info/10' },
  leakage: { icon: Shield, label: 'Carbon Leakage', color: 'bg-destructive', bgColor: 'bg-destructive/10' },
  opportunity: { icon: TrendingUp, label: 'Growth Opportunity', color: 'bg-success', bgColor: 'bg-success/10' },
};

const severityConfig = {
  high: { label: 'HIGH PRIORITY', className: 'bg-destructive text-destructive-foreground' },
  medium: { label: 'MEDIUM', className: 'bg-warning text-warning-foreground' },
  low: { label: 'LOW', className: 'bg-success text-success-foreground' },
};

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIInsightsPage = () => {
  const [expandedId, setExpandedId] = useState<string | null>(aiInsights[0]?.id || null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI Policy Assistant powered by GPT-4o Mini via OpenRouter. I can help you with:\n\n🔥 Policy Simulations:\n• "If we incentivize millets in Rajasthan"\n• "If we double CC price for rainfed farms"\n\n🧠 AI Law & Policy Analysis:\n• "What policy change increases farmer income without inflation?"\n• Regional performance analysis\n• Budget allocation recommendations\n\nI have access to real-time data on all 1,247 projects, 8,934 farmers, and state-wise performance metrics. What would you like to explore?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const highPriorityCount = aiInsights.filter(i => i.severity === 'high').length;
  const mediumCount = aiInsights.filter(i => i.severity === 'medium').length;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const getAIResponse = async (message: string): Promise<string> => {
    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) {
        return getEnhancedMockResponse(message);
      }
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an AI Policy Assistant for India's Carbon Credit Management System. You have access to comprehensive data about carbon credit projects, farmer participation, state performance, and policy outcomes.

CURRENT SYSTEM DATA:
- Total Projects: 1,247 active carbon credit projects
- Total Farmers: 8,934 registered farmers
- States Covered: All 28 states + 8 UTs
- Total Carbon Credits Generated: 156,789 BCC tokens
- Government Wallet Value: ₹98.04 Cr
- National Awareness Index: 68%
- Average Fairness Index: 0.92

STATE PERFORMANCE DATA:
- Kerala: Awareness 89%, Fairness 1.35 (Best performing)
- Maharashtra: Awareness 78%, Fairness 1.12 (High volume, good quality)
- Bihar: Awareness 31%, Fairness 0.67 (Needs intervention)
- Punjab: Awareness 65%, Fairness 1.08 (Border leakage concerns)
- Rajasthan: Awareness 45%, Fairness 0.78 (Water scarcity issues)
- Uttar Pradesh: Awareness 52%, Fairness 0.89 (High volume, low efficiency)

PROJECT TYPES:
- Regenerative Agriculture: 45% of projects
- Agroforestry: 28% of projects  
- Organic Farming: 18% of projects
- Sustainable Livestock: 9% of projects

FARMER EARNINGS BY LAND SIZE:
- 1-2 Acres: ₹4.25 Lakh avg (50 credits)
- 2-4 Acres: ₹8.5 Lakh avg (100 credits)
- 4-6 Acres: ₹13.6 Lakh avg (160 credits)
- 6-8 Acres: ₹18.7 Lakh avg (220 credits)
- 8-10 Acres: ₹23.8 Lakh avg (280 credits)
- 10+ Acres: ₹34 Lakh avg (400 credits)

CURRENT CHALLENGES:
- Bihar: Critical underperformance, low awareness
- Rajasthan: Water scarcity limiting potential
- Punjab-Haryana Border: Potential carbon leakage detected
- UP: High volume but low efficiency ratio

POLICY SIMULATION CAPABILITIES:
You can simulate policy changes like:
- "If we incentivize millets in Rajasthan" → Predict CC output, farmer income, export revenue
- "If we double CC price for rainfed farms" → Economic impact analysis
- "What policy change increases farmer income without inflation?" → Use historic data

Answer questions about subsidies, regional performance, policy recommendations, budget allocation, carbon leakage detection, and economic impact simulations. Provide specific numbers, percentages, and actionable recommendations based on the data above.`
            },
            {
              role: 'user',
              content: message
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'I apologize, but I encountered an error processing your request. Please try again.';
    } catch (error) {
      console.error('OpenRouter API error:', error);
      // Fallback to enhanced mock responses if OpenRouter API is not available
      return getEnhancedMockResponse(message);
    }
  };

  const getEnhancedMockResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced responses for policy simulations
    if (lowerMessage.includes('millet') && lowerMessage.includes('rajasthan')) {
      return `🌾 **POLICY SIMULATION: Millet Incentives in Rajasthan**

Based on Rajasthan's current performance (Awareness: 45%, Fairness: 0.78):

📈 **Predicted CC Output:**
• Current: 2,340 credits/month
• With millet incentives: 3,159 credits/month (+35%)
• Drought-resistant crops increase yield reliability

💰 **Farmer Income Impact:**
• Current avg: ₹2.3 Lakh/farmer
• Projected: ₹3.1 Lakh/farmer (+35%)
• Millet premium: ₹450/quintal additional

🌾 **Export Revenue:**
• Additional millet exports: +₹450 Cr annually
• Carbon credit exports: +₹89 Cr annually
• Total economic impact: +₹539 Cr

🎯 **Recommended Policy:**
• Subsidy: ₹1,200/credit for millet projects
• Water conservation bonus: +₹200/credit
• Fast-track approval for millet farmers`;
    }
    
    if (lowerMessage.includes('double') && lowerMessage.includes('rainfed')) {
      return `💧 **POLICY SIMULATION: Double CC Price for Rainfed Farms**

Current rainfed farm data analysis:

📊 **Economic Impact:**
• Current price: ₹850/credit
• Proposed: ₹1,700/credit (2x)
• Affected farmers: 3,247 (36% of total)

📈 **Predicted Outcomes:**
• Farmer adoption: +67% in rainfed areas
• Income increase: ₹4.2L → ₹8.4L avg
• Total credits: +45% from rainfed projects

💸 **Budget Implications:**
• Additional cost: ₹156 Cr annually
• ROI: 2.3x through increased participation
• Break-even: 18 months

⚠️ **Risk Analysis:**
• Inflation impact: Minimal (0.2% CPI)
• Market distortion: Low risk
• Sustainability: High (water conservation focus)`;
    }
    
    if (lowerMessage.includes('policy') && lowerMessage.includes('income') && lowerMessage.includes('inflation')) {
      return `🧠 **AI POLICY ANALYSIS: Income Growth Without Inflation**

Using historic CC data, climate data, and state economics:

🎯 **Optimal Policy Mix:**

1. **Tiered Subsidy System** (No inflation impact)
   • Small farms (1-2 acres): ₹1,200/credit
   • Medium farms (2-6 acres): ₹950/credit  
   • Large farms (6+ acres): ₹800/credit

2. **Efficiency Bonuses** (Productivity-based)
   • High-yield projects: +15% bonus
   • Crop diversification: +10% bonus
   • Organic certification: +20% bonus

3. **Fast-track Processing**
   • Returning farmers: -30 days approval
   • Reduces transaction costs by 25%

📈 **Predicted Impact:**
• Farmer income: +28% average increase
• CPI inflation: +0.1% (negligible)
• Budget requirement: +₹45 Cr (18% increase)
• Participation growth: +40% in 2 years`;
    }
    
    // Fallback to existing mock responses
    if (lowerMessage.includes('maharashtra') && lowerMessage.includes('subsidy')) {
      return aiChatResponses['subsidy maharashtra'];
    }
    if (lowerMessage.includes('bihar') && lowerMessage.includes('subsidy')) {
      return aiChatResponses['subsidy bihar'];
    }
    if (lowerMessage.includes('best') || lowerMessage.includes('performing') || lowerMessage.includes('top')) {
      return aiChatResponses['best performing'];
    }
    if (lowerMessage.includes('leakage') || lowerMessage.includes('border')) {
      return aiChatResponses['carbon leakage'];
    }
    if (lowerMessage.includes('budget') || lowerMessage.includes('allocation')) {
      return aiChatResponses['budget allocation'];
    }
    
    return `I'm currently in offline mode but can still help! I have access to comprehensive data on all 1,247 projects and 8,934 farmers. Try asking about:

🔥 **Policy Simulations:**
• "If we incentivize millets in Rajasthan"
• "If we double CC price for rainfed farms"

🧠 **Analysis Questions:**
• "What policy increases farmer income without inflation?"
• "Which states are performing best?"
• "Recommend budget allocation"

I'll provide detailed analysis using our extensive database.`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get AI response
      const response = await getAIResponse(currentMessage);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">AI Policy Insights</h2>
          <p className="text-muted-foreground">Data-driven recommendations for policy optimization</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20">
            <span className="text-destructive font-semibold">{highPriorityCount}</span>
            <span className="text-sm text-muted-foreground ml-2">High Priority</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-warning/10 border border-warning/20">
            <span className="text-warning font-semibold">{mediumCount}</span>
            <span className="text-sm text-muted-foreground ml-2">Medium</span>
          </div>
          <Button 
            className="gradient-primary"
            onClick={() => setIsChatOpen(true)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Ask AI
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon;
          const count = aiInsights.filter(i => i.category === key).length;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("p-4 rounded-xl border border-border", config.bgColor)}
            >
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.color)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display">{count}</p>
                  <p className="text-xs text-muted-foreground">{config.label}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {aiInsights.map((insight, index) => {
          const category = categoryConfig[insight.category];
          const severity = severityConfig[insight.severity];
          const CategoryIcon = category.icon;
          const isExpanded = expandedId === insight.id;

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl overflow-hidden"
            >
              {/* Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : insight.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", category.color)}>
                      <CategoryIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={severity.className}>{severity.label}</Badge>
                        <Badge variant="outline">{category.label}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {insight.confidence}% confidence
                        </span>
                      </div>
                      <h3 className="font-display font-semibold text-lg">{insight.region}</h3>
                      <p className="text-muted-foreground">{insight.issue}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t border-border"
                >
                  <div className="p-6 space-y-6">
                    {/* Reason */}
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">ROOT CAUSE ANALYSIS</h4>
                      <p className="text-foreground">{insight.reason}</p>
                    </div>

                    {/* Predicted Outcome Graph */}
                    {insight.predictedOutcome && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-3">PREDICTED OUTCOME</h4>
                        <div className="p-4 rounded-xl bg-muted/30 border border-border">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-primary" />
                              <span className="font-medium">Implementation Impact Projection</span>
                            </div>
                            <Badge className="bg-success/10 text-success border-success/20">
                              +{insight.predictedOutcome.improvementPercent}% Growth
                            </Badge>
                          </div>
                          <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={insight.predictedOutcome.months.map((month, idx) => ({
                                month,
                                before: insight.predictedOutcome!.before[idx],
                                after: insight.predictedOutcome!.after[idx]
                              }))}>
                                <defs>
                                  <linearGradient id={`afterGradient-${insight.id}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(160, 84%, 28%)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="hsl(160, 84%, 28%)" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 88%)" vertical={false} />
                                <XAxis 
                                  dataKey="month" 
                                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis 
                                  tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <Tooltip 
                                  contentStyle={{ 
                                    backgroundColor: 'hsl(0, 0%, 100%)', 
                                    border: '1px solid hsl(220, 20%, 88%)',
                                    borderRadius: '12px'
                                  }}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="before" 
                                  stroke="hsl(215, 16%, 47%)" 
                                  strokeWidth={2}
                                  strokeDasharray="5 5"
                                  dot={false}
                                  name="Without Implementation"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="after"
                                  fill={`url(#afterGradient-${insight.id})`}
                                  stroke="hsl(160, 84%, 28%)"
                                  strokeWidth={2}
                                  name="With Implementation"
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex justify-center gap-6 mt-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-0.5 bg-muted-foreground" style={{ borderStyle: 'dashed', borderWidth: '1px 0 0 0', borderColor: 'hsl(215, 16%, 47%)' }} />
                              <span className="text-xs text-muted-foreground">Current Trajectory</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-0.5 bg-primary" />
                              <span className="text-xs text-muted-foreground">With Recommendations</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-3">RECOMMENDED ACTIONS</h4>
                      <div className="space-y-2">
                        {insight.suggestedActions.map((action, idx) => (
                          <div 
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-xl bg-muted/50"
                          >
                            <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-primary-foreground">{idx + 1}</span>
                            </div>
                            <p className="text-sm">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button className="gradient-primary">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Implement Actions
                      </Button>
                      <Button variant="outline">
                        Schedule Review
                      </Button>
                      <Button variant="ghost" className="ml-auto">
                        Dismiss Insight
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* AI Chatbot Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsChatOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl shadow-xl w-full max-w-2xl h-[600px] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Policy Assistant (GPT-4o Mini)</h3>
                    <p className="text-xs text-muted-foreground">Powered by openai/gpt-4o-mini via OpenRouter</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex",
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={cn(
                      "max-w-[80%] p-4 rounded-2xl",
                      message.role === 'user' 
                        ? 'gradient-primary text-primary-foreground rounded-br-none' 
                        : 'bg-muted rounded-bl-none'
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={cn(
                        "text-xs mt-2",
                        message.role === 'user' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                      )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted p-4 rounded-2xl rounded-bl-none">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggested Questions */}
              <div className="px-4 py-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'If we incentivize millets in Rajasthan',
                    'If we double CC price for rainfed farms',
                    'What policy change increases farmer income without inflation?',
                    'Which states are performing best?'
                  ].map((question) => (
                    <Button
                      key={question}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setInputMessage(question);
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about subsidies, performance, or recommendations..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    className="gradient-primary"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIInsightsPage;
