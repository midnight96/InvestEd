from django.core.management.base import BaseCommand
from lessons.models import Lesson

LESSONS = [
    {
        "title": "Challenge 1: The Short Squeeze",
        "order_index": 1,
        "content": "### What is a Short Squeeze?\n\nIn the stock market, 'short selling' is when a trader borrows shares to sell them, hoping the price will fall so they can buy them back cheaper, return them, and pocket the difference.\n\nHowever, if the price *rises* instead, short sellers start losing money. To cut their losses, they must buy back the stock. This surge in buying pressure, combined with regular buyers, drives the price up exponentially. This is called a **Short Squeeze** (famous examples include GameStop in 2021).",
        "quiz": [
            {
                "question": "What is the primary action a short-seller must take to exit their position?",
                "options": [
                    "Sell more borrowed shares",
                    "Buy back the shares from the market",
                    "Convert their shares into bonds"
                ],
                "correct_index": 1
            },
            {
                "question": "Which of the following describes a 'Short Squeeze'?",
                "options": [
                    "A rapid drop in price due to bad earnings",
                    "A rapid rise in price triggered by short-sellers rushing to buy back shares to close losses",
                    "A horizontal market movement with zero trading volume"
                ],
                "correct_index": 1
            }
        ]
    },
    {
        "title": "Challenge 2: The Earnings Season Dilemma",
        "order_index": 2,
        "content": "### Trading Around Earnings Reports\n\nEvery quarter, public companies report their financial results. Sometimes, a company reports higher revenue and profits than the previous year, yet its stock price *plummets* immediately after the announcement. \n\nWhy? Because the market operates on **expectations**. If analysts expected even *higher* growth, or if the company's future 'guidance' (forecast) is weak, investors will sell. This is known as 'buying the rumor, selling the news.'",
        "quiz": [
            {
                "question": "Why might a stock price fall even after a company reports positive earnings?",
                "options": [
                    "The results did not meet high analyst expectations or future guidance was weak",
                    "The company earned too much cash which is illegal",
                    "The exchange always halts stocks that make a profit"
                ],
                "correct_index": 0
            },
            {
                "question": "What does the market adage 'Buy the rumor, sell the news' mean?",
                "options": [
                    "Buy stocks when rumors are quiet, and sell them only when you read newspapers",
                    "Stock prices rise in anticipation of good news, then fall when the news is officially announced as traders take profit",
                    "Always buy stocks immediately after a press release"
                ],
                "correct_index": 1
            }
        ]
    },
    {
        "title": "Challenge 3: The Stock Split Illusion",
        "order_index": 3,
        "content": "### Stock Splits and Dividends\n\nImagine you have a ₹1,000 note. If you exchange it for two ₹500 notes, your total wealth hasn't changed. \n\nThis is exactly what a **Stock Split** is. If a company announces a 2-for-1 stock split, the number of shares doubles, but the price of each share is halved. The total market capitalization of the company remains exactly the same. Companies do this to make their shares look cheaper and more accessible to retail investors.",
        "quiz": [
            {
                "question": "If you own 10 shares of Company X valued at ₹1,000 each, and they do a 2-for-1 stock split, what do you own now?",
                "options": [
                    "20 shares valued at ₹1,000 each",
                    "20 shares valued at ₹500 each",
                    "5 shares valued at ₹2,000 each"
                ],
                "correct_index": 1
            },
            {
                "question": "What is the primary reason companies perform a stock split?",
                "options": [
                    "To pay out cash rewards to shareholders",
                    "To increase the company's overall market valuation",
                    "To lower the per-share price and make the stock more accessible to small investors"
                ],
                "correct_index": 2
            }
        ]
    },
    {
        "title": "Challenge 4: Market Psychology & FOMO",
        "order_index": 4,
        "content": "### Emotional Investing\n\nMarkets are driven by two main emotions: **Fear** and **Greed**. \n\n**FOMO** (Fear Of Missing Out) occurs when investors see a stock skyrocketing and rush to buy it at peak prices, fearing they will miss out on easy gains. This often leads to buying bubbles that inevitably burst. Smart investors try to buy when there is 'blood on the streets' (panic) and sell when everyone is overly greedy.",
        "quiz": [
            {
                "question": "What does FOMO stand for in stock trading?",
                "options": [
                    "Financial Operations & Market Outcomes",
                    "Fear Of Missing Out",
                    "Free Options Market Order"
                ],
                "correct_index": 1
            },
            {
                "question": "According to legendary investor Warren Buffett, when should you be 'greedy'?",
                "options": [
                    "When others are greedy",
                    "When others are fearful",
                    "When stock prices are at an all-time high"
                ],
                "correct_index": 1
            }
        ]
    },
    {
        "title": "Challenge 5: Chart Indicators & Golden Cross",
        "order_index": 5,
        "content": "### Technical Analysis Basics\n\nTechnical traders use charts and moving averages to identify trends. \n\nOne famous bullish signal is the **Golden Cross**. This happens when a short-term moving average (e.g., the 50-day moving average) crosses *above* a long-term moving average (e.g., the 200-day moving average). It indicates that momentum is turning positive and a major uptrend may be starting.",
        "quiz": [
            {
                "question": "What is a 'Golden Cross' in stock chart patterns?",
                "options": [
                    "When a stock price hits exactly ₹1,000",
                    "When a short-term moving average crosses above a long-term moving average",
                    "When a company files for bankruptcy"
                ],
                "correct_index": 1
            },
            {
                "question": "A Golden Cross is generally interpreted by traders as a...",
                "options": [
                    "Bullish (buy) signal",
                    "Bearish (sell) signal",
                    "Neutral (hold) signal"
                ],
                "correct_index": 0
            }
        ]
    }
]


class Command(BaseCommand):
    help = "Seeds the database with starter stock market trivia and challenges."

    def handle(self, *args, **options):
        # First clear out old lessons to avoid name duplication or old entries
        Lesson.objects.all().delete()
        for l in LESSONS:
            obj, created = Lesson.objects.update_or_create(
                title=l["title"],
                defaults={"content": l["content"], "order_index": l["order_index"], "quiz": l["quiz"]},
            )
            self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Updated'}: {obj.title}"))
