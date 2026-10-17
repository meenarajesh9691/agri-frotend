# Agri Shop: Frontend (design step)
Next.js 15 + TypeScript + Tailwind 4 + lucide-react. Abhi data `src/data/mock.ts` se aata hai.

    npm install && npm run dev      # http://localhost:3000

Screens: /dashboard, /inventory, /billing (F2 = bill, F4 = naya bill). Hindi/English toggle header mein, texts `src/messages/`. Phone par neeche ka menu.

## Login aur subscription (is step mein)
- `/login` phone + password. Owner `/dashboard` par, staff `/billing` par jaata hai.
- Backend `/api/auth/me` se user, dukaan aur subscription ka haal aata hai (`lib/auth-context.tsx`). Tab par wapas aane par dobara check hota hai.
- Plan khatam hone se 7 din pehle peeli patti, khatam hone ke baad (5 din grace) lal patti, uske baad bill band.
- Staff ko Dashboard aur Reports nahi dikhte. Settings mein owner staff jod aur band kar sakta hai.
- `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

## Products aur catalog (is step mein)
- `/products`: dukaan ke asli products (API se). Owner naya product jod/badal/hata sakta hai, staff sirf dekhta hai.
- Barcode box: scan karo. Mila to edit khulta hai, nahi mila to naya product form (barcode bhara hua).
- `/products/import`: admin ke master catalog se tick karke jodna. Rate shuru mein MRP hota hai, baad mein badal sakte hain.
- Billing aur Inventory screen abhi demo data par hain. Agle step (stock/batch) mein asli data se judenge.

## Stock aur batch (is step mein)
- `/inventory`: asli stock (API se). Status: In Stock, Low, Out, Jaldi Expire (30 din), Expired. "Batches" par batch-wise maal, owner adjust ya hata sakta hai.
- `/inventory/receive`: "Naya maal aaya". Supplier, bill number, phir har product ka batch, expiry (MM/YYYY likhein), quantity, kharid rate.
- Dashboard: low stock aur products ke asli aankde, aur expiry ke teen cards (lal, peela, neela) jinse expired maal hatate hain.
- Billing screen abhi demo data par hai. Agle step mein asli stock (FIFO batch) se judega.

## Billing aur khata (is step mein)
- `/billing`: asli stock se. Barcode scan ya naam, FIFO batch server chunta hai, rate/GST/total server nikalta hai (screen ka total sirf dikhane ke liye).
- Payment: Cash, UPI, Udhaar, Aadhi (partial). Udhaar/Aadhi ke liye kisaan chunna ya wahin jodna zaroori.
- Save fail ho to dobara dabane par bill double nahi banta (har bill ki ek pehchaan). F2 = bill, F4 = naya bill.
- `/bills`: saare bill, owner cancel kar sakta hai (stock wapas, udhaar hata).
- `/customers`: kisaan, baaki rakam, khata aur "paisa jama lein".
- Settings: stock kam hone par bill rokna ya na rokna.
- Print aur WhatsApp bill agle step mein.
