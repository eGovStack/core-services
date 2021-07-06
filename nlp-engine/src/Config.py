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
