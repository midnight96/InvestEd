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
