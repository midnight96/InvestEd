from django.core.management.base import BaseCommand
from lessons.models import Lesson

LESSONS = [
    {
        "title": "What is a Stock?",
        "order_index": 1,
        "content": "A stock is a small ownership slice of a company. When you buy one "
                    "share of a company, you own a tiny piece of it -- if the company "
                    "grows and becomes more valuable, your share (usually) becomes more "
                    "valuable too. Stocks can also lose value if the company performs "
                    "poorly, which is why they're considered a higher-risk, "
                    "higher-potential-reward investment compared to, say, a savings account.",
        "quiz": [
            {"question": "Buying a stock means you own...", "options": ["A loan to the company", "A small piece of the company", "A government bond"], "correct_index": 1},
            {"question": "Stock prices can go...", "options": ["Only up", "Only down", "Up or down"], "correct_index": 2},
        ],
    },
    {
        "title": "What is a Mutual Fund?",
        "order_index": 2,
        "content": "A mutual fund pools money from many investors and a professional "
                    "fund manager invests it across many stocks, bonds, or other assets. "
                    "Instead of picking individual stocks yourself, you're buying "
                    "instant diversification in one purchase. This usually means lower "
                    "risk than a single stock, though returns are typically smoother "
                    "rather than spectacular.",
        "quiz": [
            {"question": "A mutual fund is managed by...", "options": ["You directly", "A professional fund manager", "The government"], "correct_index": 1},
            {"question": "A key benefit of mutual funds is...", "options": ["Guaranteed profit", "Instant diversification", "No risk at all"], "correct_index": 1},
        ],
    },
    {
        "title": "SIP vs Lump Sum",
        "order_index": 3,
        "content": "A SIP (Systematic Investment Plan) means investing a fixed small "
                    "amount regularly (e.g. every month) instead of one big lump sum. "
                    "SIPs average out your purchase price over time -- you buy more "
                    "units when prices are low and fewer when prices are high, which "
                    "reduces the risk of bad timing. This is a common, beginner-friendly "
                    "way for students to start investing with very little money.",
        "quiz": [
            {"question": "SIP stands for...", "options": ["Stock Investment Plan", "Systematic Investment Plan", "Simple Interest Plan"], "correct_index": 1},
            {"question": "A benefit of SIPs is...", "options": ["Averaging out purchase price over time", "Guaranteed high returns", "No need to invest regularly"], "correct_index": 0},
        ],
    },
    {
        "title": "Risk vs Return",
        "order_index": 4,
        "content": "Generally, investments with higher potential returns come with "
                    "higher risk of loss. A savings account is low risk but low "
                    "return. Stocks can offer high returns but can also lose value "
                    "quickly. Understanding your own risk tolerance -- how much loss "
                    "you can handle without panic-selling -- is one of the most "
                    "important investing skills, more important than picking 'winning' stocks.",
        "quiz": [
            {"question": "Higher potential return usually comes with...", "options": ["Lower risk", "Higher risk", "No relationship"], "correct_index": 1},
            {"question": "Risk tolerance means...", "options": ["How much loss you can handle calmly", "How much profit you want", "How many stocks you own"], "correct_index": 0},
        ],
    },
    {
        "title": "Diversification",
        "order_index": 5,
        "content": "Diversification means spreading your money across different "
                    "investments so that one bad performer doesn't sink your whole "
                    "portfolio. The old saying is 'don't put all your eggs in one "
                    "basket.' A diversified portfolio might hold several different "
                    "stocks across different industries, plus mutual funds, rather "
                    "than everything in a single company.",
        "quiz": [
            {"question": "Diversification means...", "options": ["Investing in only one stock", "Spreading money across different investments", "Only investing in mutual funds"], "correct_index": 1},
        ],
    },
    {
        "title": "How Stock Prices Rise and Fall",
        "order_index": 6,
        "content": """**Imagine a Lemonade Stand**

Your friend Ravi opens a lemonade stand. He tells you, "If you give me ₹100, you will own 10% of my shop!" You think, "That's cool!" and give him ₹100. Now you are a part-owner!

**What is a Stock?**
A stock represents a tiny ownership slice of a company. Just like you became a part-owner of Ravi's stand, when you buy a company's stock, you become a small owner of that company.

**Why do Stock Prices Rise?**

One day, it gets extremely hot during summer. Everyone is thirsty! Ravi's lemonade is flying off the shelf! People are lining up. Business is booming!

Now, a new customer comes along and says, "I also want to be an owner! Will you sell your share for ₹100?" You reply, "No way! The business is doing so well now, I want ₹150!" Look at that! Your investment grew from ₹100 to ₹150!

**Why stock prices rise:**
✅ The company's business is doing great (strong sales, profits)
✅ People believe the company will make more money in the future (optimism)
✅ More people want to buy the stock (high demand)
✅ The company launched something new and amazing (a hit product!)

**Why do Stock Prices Fall?**

A week later, it starts raining heavily. No one wants cold lemonade in the rain. Ravi's sales drop, and the stand starts losing money.

Now, that new customer tells you, "I don't want this investment anymore. ₹150 is too expensive!" No one is willing to pay ₹150. You end up selling it for ₹80 to cut your losses. Oh no! You made a loss!

**Why stock prices fall:**
❌ The company's business is performing poorly (declining sales, losses)
❌ People are scared they will lose their money (fear/panic)
❌ Everyone is selling their shares (high supply, low demand)
❌ The company made a bad decision or faced a crisis (bad news)
❌ The broader economy is facing issues (recession, high inflation)

**In the Real Stock Market:**
The exact same thing happens! When Apple launches a new iPhone and millions of people buy it → the stock price goes up! ⬆️
When a company reports a loss or gets into a scandal → the stock price goes down! ⬇️

**The Key Lesson:**
Ups and downs are a completely normal part of the stock market! Just like the weather changes, stock prices fluctuate. Good investors do not panic. They focus on the long-term (years) rather than daily ups and downs.

**Remember:**
🎢 Roller coaster ride - the stock market has ups and downs.
📊 Short-term volatility is normal (daily prices go up and down).
🌱 Long-term, good companies tend to grow.
😌 Patience is the secret to smart investing!
""",
        "quiz": [
            {"question": "When does a stock price usually rise?", "options": ["When the company's business is doing well and demand is high", "When the company is making a loss", "When everyone is selling their shares"], "correct_index": 0},
            {"question": "If a lemonade stand's business slows down due to rain, its share price will most likely...", "options": ["Increase significantly", "Fall because sales are low", "Stay the exact same"], "correct_index": 1},
            {"question": "What should a good investor do when a stock price temporarily falls?", "options": ["Panic and sell everything immediately", "Wait to sell at the absolute highest price", "Think long-term and look at company fundamentals"], "correct_index": 2},
            {"question": "What is the stock market compared to in this lesson?", "options": ["A straight line", "A roller coaster (with ups and downs)", "A sleeping pill"], "correct_index": 1},
        ],
    },
]


class Command(BaseCommand):
    help = "Seeds the database with starter lessons and quizzes."

    def handle(self, *args, **options):
        for l in LESSONS:
            obj, created = Lesson.objects.update_or_create(
                title=l["title"],
                defaults={"content": l["content"], "order_index": l["order_index"], "quiz": l["quiz"]},
            )
            self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Updated'}: {obj.title}"))
