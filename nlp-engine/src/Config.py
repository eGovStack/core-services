LANGUAGE_CODES = {
    'english':'en',
    'hindi':'hi',
    'marathi': 'mr', 'gujarati':'gu', 'punjabi':'pa',  'kannada':'kn', 'tamil':'ta', 'malayalam': 'ml', 'telugu':'te', 'bengali': 'bn', 'bangla': 'bn'

    }
    
TAX_ENTITIES = ['water', 'sewerage', 'electricity', 'property','income','trade license']
WATER_LINK_PAID = "https://onlinepaymentindia.com/wp-content/uploads/2019/01/CIDCO-Duplicate-Receipts-View-Download-Print.png"
WATER_LINK_UNPAID = "https://stvending.punjab.gov.in/wsbills/"
PROPERTY_LINK_PAID = "https://4.bp.blogspot.com/_3pstdxEpDfk/S-s0R9A704I/AAAAAAAAABk/PO0BoEBHKR8/s1600/real-property-tax-recpt.jpg"
PROPERTY_LINK_UNPAID = "https://amritsar.nic.in/service/property-tax-pay-online/"
TRADE_LINK_PAID = "https://www.bombayintelligence.com/file_repo/big/PUNJAB-RENEWED.jpg"
TRADE_LINK_UNPAID = "https://cdma.ap.gov.in/en/trade-license"

KEYWORD_LINK = "https://raw.githubusercontent.com/egovernments/egov-mdms-data/DEV/data/pb/Chatbot/KeyWords.json"
STOPWORD_LINK = "https://raw.githubusercontent.com/egovernments/egov-mdms-data/DEV/data/pb/Chatbot/StopWords.json"

CATEGORY_ERROR = "Please mention a category for bill payment/receipts."
    







########### MDMS SERVICE #####################

MDMS_HOST = 'http://egov-mdms-service.egov:8080/'
MDMS_SEARCH_URL = 'egov-mdms-service/v1/_search'
MDMS_MODULE_NAME = 'Chatbot'
CITY_MASTER = 'CityNames'
CITY_LOCALE_MASTER = 'CityLocaleMasterData'

########### EGOV-LOCATION SERVICE ###############
EGOV_LOCATION_HOST = 'http://egov-location.egov:8080/'
EGOV_LOCATION_SEARCH_URL = 'egov-location/location/v11/boundarys/_search'


STATE_LEVEL_TENANTID = 'pb'

GUPSHUP_URL = "https://api.gupshup.io/sm/api/v1/msg"
SRC_NAME = "&src.name=chatbotpayment"
CITY_CONFIRMATION = "If your city is detected correctly, you can continue with your bill/receipt queries.\n Else, kindly type your city name again.\n "
ASK_CITY_NAME = "Please enter your city name\n"
PREFIX = 'channel=whatsapp&source=917834811114&destination='

WATER_RECEIPTS = '&message=%7B%22type%22%3A%22file%22%2C%22url%22%3A%22https%3A//www.buildquickbots.com/whatsapp/media/sample/pdf/sample01.pdf%22%2C%22caption%22%3A%22%22%2C%22filename%22%3A%22Water_Sewerage_receipts.pdf%22%7D'
TRADE_RECEIPTS = '&message=%7B%22type%22%3A%22file%22%2C%22url%22%3A%22https%3A//www.buildquickbots.com/whatsapp/media/sample/pdf/sample01.pdf%22%2C%22caption%22%3A%22%22%2C%22filename%22%3A%22Trade_license_receipts.pdf%22%7D'
PROPERTY_RECEIPTS = '&message=%7B%22type%22%3A%22file%22%2C%22url%22%3A%22https%3A//www.buildquickbots.com/whatsapp/media/sample/pdf/sample01.pdf%22%2C%22caption%22%3A%22%22%2C%22filename%22%3A%22Property_Tax_receipts.pdf%22%7D'

WATER_BILL = '&message=%7B%22type%22%3A%22file%22%2C%22url%22%3A%22https%3A//www.buildquickbots.com/whatsapp/media/sample/pdf/sample01.pdf%22%2C%22caption%22%3A%22%22%2C%22filename%22%3A%22Water_Sewerage_bills.pdf%22%7D'
TRADE_BILL = '&message=%7B%22type%22%3A%22file%22%2C%22url%22%3A%22https%3A//www.buildquickbots.com/whatsapp/media/sample/pdf/sample01.pdf%22%2C%22caption%22%3A%22%22%2C%22filename%22%3A%22Trade_license_bills.pdf%22%7D'
PROPERTY_BILL = '&message=%7B%22type%22%3A%22file%22%2C%22url%22%3A%22https%3A//www.buildquickbots.com/whatsapp/media/sample/pdf/sample01.pdf%22%2C%22caption%22%3A%22%22%2C%22filename%22%3A%22Property_Tax_bills.pdf%22%7D'
CATEGORY = '&message=Please%20mention%20a%20category'
CITY_PART_1 = "We have detected *"
CITY_PART_2 = "* as your city."

WELCOME_MESSAGE = "Welcome to the *DIGIT* platform ! Please type in your city name.\n"
DESTINATION = '9619367055'
SRC_NAME_LOCALITY = "&src.name=LocalitySearch"
INVALID_SELECTION = "&message=Please enter a valid selection\nType 'mseva' to return back to the main menu."
LOCALITY_DETECTED = "&message=Locality detected--> "
MESSAGE_TOKEN = "&message="

GREETINGS = ["hi","hello","mseva","नमस्ते","नमस्कार","ਹਾਇ","ਸਤ ਸ੍ਰੀ ਅਕਾਲ"]

WELCOME_RESULT = "Welcome"
WATER = 'water'
TRADE = 'trade'
PROPERTY = 'property'

RECEIPT_TOKEN = 'Showing'
BILL_TOKEN = 'Visit'
BILL_TOKEN_NEW='You'
UTF_8 = 'utf-8'

ASK_LOCALITY_NAME = "Type the name of your locality\nType 'mseva' to return back to the main menu."
CITY_LIST = "Did you mean any one of the following cities ? Enter the number of your city.\n"
CITY_LOCALHOST = "http://127.0.0.1:8080/nlp-engine/fuzzy/city"
LOCALITY_LOCALHOST = "http://127.0.0.1:8080/nlp-engine/fuzzy/locality"
LOCALITY_LIST = "Did you mean any one of the following localities ? Enter the number of your locality.\n"
MSEVA = "Type 'mseva' to return back to the main menu."
VALID_SELECTION = "Please enter a valid selection"

TO_BE_PAID = ['to be paid', 'to be paid','not paid yet','not yet paid']
INVALID = "invalid"

SORRY= "Sorry, I did not understand that. Please try again."
WELCOME_BILLS= "Welcome to the *DIGIT* platform ! Now you can pay your bills and retrieve paid receipts for property, water and sewerage and trade licenses.\n"+"Type in your queries and I will try my best to help you !\n"+ "At any stage, type *quit* if you want to exit."
EXIT = "Exiting..."
YOU_MAY_VISIT = 'You may visit '
FOR_PAYING_PREFIX = ' for paying your '
RECEIPTS = " receipts "
BILLS = " bills "
KEEP_WORDS = ['are','to','be','not']
MISCELLANEOUS = ['to','be','hi','hello','water', 'sewerage', 'electricity', 'property','income','trade license','show','see','bills']

SEWERAGE = 'sewerage'
TRADE_LICENSE = 'trade license'