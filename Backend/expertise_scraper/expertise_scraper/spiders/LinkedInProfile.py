import scrapy


class LinkedinprofileSpider(scrapy.Spider):
    name = "LinkedInProfile"
    allowed_domains = ["linkedin.com"]
    start_urls = ["https://linkedin.com"]

    def parse(self, response):
        pass
