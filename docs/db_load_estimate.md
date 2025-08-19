# Input data:
Let's try to calculate load. 
Emmanuel community has around 11500 members spread over 5 continents and 67 countries. 
assume 100% is eligible for companionship. 
assume each 100 members need one (CD) - calculate Companionship Delegates number (they are main target personas), 
companionship change may happen once a year per given member. 
Let's even increase it to twice a year. based on this information please do calculate potential standard and peak database load per period. 
As a period use same timespan as it is used by Azure Database for PostgreSQL pricing
(I don't know how frequently it is invoiced). 
Provide calculations and final result for load and price.

---
### 📊 User and Transaction Analysis

First, let's establish the user base and the number of core "write" transactions.

* **Companionship Delegates (CDs)**: With 11,500 members and a ratio of 1 CD per 100 members, we have:
    `11,500 / 100 = 115 primary users`.
* **Write Transactions**: The main "write" event is a companionship change. You've estimated this occurs twice a year per member.
    `11,500 members * 2 changes/year = 23,000 write transactions/year`.

For this analysis, I'll make a conservative assumption that for every **one write transaction**, a delegate performs **twenty read operations** (e.g., viewing the graph, filtering lists, checking profiles).

---
### 📈 Standard and Peak Load Calculation

Azure invoices its services **monthly**, so we'll calculate our load based on that period.

* **Standard Monthly Load**:
    * **Writes**: `23,000 / 12 months ≈ 1,917 writes/month`
    * **Reads**: `1,917 * 20 ≈ 38,340 reads/month`
    * **Total**: `~40,250 transactions/month`

* **Peak Monthly Load**:
    User activity won't be evenly spread. Let's assume that activity is concentrated and that one month of the year might see **three times the average load** due to seasonal planning or reporting.
    * **Writes**: `1,917 * 3 = 5,751 writes/peak month`
    * **Reads**: `5,751 * 20 = 115,020 reads/peak month`
    * **Total**: `~120,771 transactions/peak month`

Even during a peak month, this averages to just **three transactions per minute**. This is an **extremely low load** for any modern database system. The system will be idle most of the time.

---
### 💰 Azure Pricing and Recommendation

Given the very low and intermittent load, we don't need a powerful, expensive database. The best choice on Azure is the **"Burstable"** compute tier for PostgreSQL. It's designed specifically for applications like this, providing a baseline performance level with the ability to "burst" to full CPU power to handle occasional activity spikes.

* **Recommended Tier**: **Burstable B1ms instance** (1 vCore, 2 GiB RAM).
* **Estimated Cost**: **~$25 - $35 per month**. This estimate includes the compute cost for the server, a small amount of provisioned storage (e.g., 32 GB), and geographically redundant backups.

This cost is for the database component only and does not include the cost of hosting the application itself (e.g., on Vercel or Azure App Service).