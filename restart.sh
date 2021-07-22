#  const restart1Command = "pm2 reload stats_3128 && pm2 reload main_5000 && pm2 reload compression_3129"
pm2 restart compression_3129
sleep 2
pm2 restart stats_3128 
sleep 2
pm2 restart main_5000