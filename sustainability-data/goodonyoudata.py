# Imports
from bs4 import BeautifulSoup
import requests
import json
import time


# Retrieving all subcategories of Good on You directory
URL = 'https://directory.goodonyou.eco/?_gl=1*1t6ajb4*_ga*MTk4OTk0NzA0MS4xNzUwMTYyMjc1*_ga_TTB1J3Q9MN*czE3NTAxNjIyNzUkbzEkZzAkdDE3NTAxNjIyNzUkajYwJGwwJGgw'
res = requests.get(URL)

soup = BeautifulSoup(res.content, 'html5lib') 
fashion_categories = []
for brand in soup.findAll('h1')[1:]:
  fashion_categories.append(brand.get_text())
beauty_categories = ['Face Makeup', 'Eye Makeup', 'Lip Makeup', 'Nails', 'Skincare', 'Suncare & Tanning', 'Haircare', 'Fragrance', 'Bath & Body', 'Dental']


# Getting displayed brands on Good on You directories
brand_list = []
for index, subcategory in enumerate(fashion_categories):
  subpath = subcategory.split('&')[0].strip().lower().replace(' ', '-')
  if index == 5: subpath = 'knitwear'
  
  URL = f'https://directory.goodonyou.eco/categories/fashion/{subpath}'
  res = requests.get(URL)
  soup = BeautifulSoup(res.content, 'html5lib')
  s = soup.findAll('script', {'id' : '__NEXT_DATA__'})[-1]
  brand_list += json.loads(s.string)['props']['pageProps']['category']['brands']
  time.sleep(1)

for index, subcategory in enumerate(beauty_categories):
  subpath = subcategory.strip().lower().replace(' ', '-')
  
  URL = f'https://directory.goodonyou.eco/categories/beauty/{subpath}'
  res = requests.get(URL)
  soup = BeautifulSoup(res.content, 'html5lib')
  s = soup.findAll('script', {'id' : '__NEXT_DATA__'})[0]
  brand_list += json.loads(s.string)['props']['pageProps']['category']['brands']
  time.sleep(1)


# Get rating summaries of each brand
ratings_json = {}
for index, brand in enumerate(brand_list):
  URL = f'https://directory.goodonyou.eco/brand/{brand['id']}'
  res = requests.get(URL)
  soup = BeautifulSoup(res.content, 'html5lib')

  # Get rating summary and rating explanation
  s = soup.find('h6')
  rating = s.get_text().split(': ')[-1]
  s = soup.find('div', id='rating-summary-text')
  summary = s.get_text()

  if summary == 'Rating summary coming soon.': continue # No explicit justifications yet
  
  ratings_json[brand['name']] = {
    'rating': rating,
    'summary': summary
  }
  time.sleep(1)

final_json = {'brand_ratings': ratings_json}
with open('ratings.json', 'w') as file:
  file.write(json.dumps(final_json, indent=4))