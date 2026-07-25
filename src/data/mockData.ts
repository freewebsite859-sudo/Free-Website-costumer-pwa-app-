import { Salon, Booking, UserLocation } from '../types';

export const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdwqVBUEuosIJ_cJgc9No6Q6mJJLfi_-vzNmbu-Hlvo8EoZ3aeEc5AsBZpCd7EDzA_nWsgue2XIPsg4VqQPI3v4JSAfXDGo-Wa3QUE0znR5W3lSau81IHjKHVMMszkTHm37WqAZZG5pVselF7MwAPFfSXkL596P_Hn9_MEk0bCJbxsvUhCMRkvJxXUA7UiNZdVjcCaWMFFj0saocYM8idqSL0Yj_5kq5HUA3RbAtVK0TDLj0BzPKS8ya9q6-ySo8S_IjLw2z3S6vE';
export const LOGO_SQUARE = 'https://lh3.googleusercontent.com/aida/AP1WRLssaHnO48BWLXlAqfk5azqzlovjy2eVye4ay7yOzpLtGH8z_NKAQEKbfuiMJUfBVZVHOVI0qikGdg2BzwbtXuVGSotKkPwY_DMQTzr5O3ZJyh0KWWvEHKCfLA89bSIih5IS6OmmEaLke3lG1c6GHrvOdoaW3jiiVviWA1zz1Adkjpnyx9Rhfvx1QlxqCuFW5zLTmb4jBEo06T7VPQG-h2RMxRB-xwxkC68PrSrIL0IwBCDUKHIwiFZ32A';
export const AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOG1KE6QycrqAoi7dvqGoKSboLCppWbW1iEIxfa-y3Kt9PqLCrLFbTlN81KwatwAqsjiP6pC5EuRgNifKMXn1jJAUtJmQ-OOnG2guAwtwASOf_UxNibUixlHs1-s_VNPq8I1Z01uqo7WtWFJW-AlR3Ev8MP7fqPsta3lByjgM0pUznoxoZ2wbsAu4nP1nMxUIMX-nkMAHauG1IaOLN7F1OVYtFUWyN_ii8Tg0neCdN1V-w_AlDNuC-zn5yePu84wt5QkuDxg4sjhM';
export const BANNER_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn991u77TB1QyV1AdBOSD9Jub7f5x5unJ3YPA0BDgK3swZsZaLvaxP0ik4sGEXA7VftRQ0xH3pJa7JDlVtvEh0JM8d0DoCeAntUDfq8A2cY6hsssagHPGnI2grUSeAkB_iz_XM8HD4V9jad5jWs8vrm-0cQH4LPFfUKr0UGMUrs9ugln2A-o6bjCycqKyGC-a1w5q2FFt7GX_oMNAsUVXo4zV1SqldpGwYNedjEs3yZy84q1pDL_cWc56gd0Xb_U-UFmWot0yH4qw';
export const LOCATION_PIN_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtvEyTkpLk9SfuFRowvBqe-LhfEaeJ4EN4EXFd2Jc4epPo3YNlLbrCphpf9KpbhCEo0tsRiMt2-1LeI-aXpINydWYomtYhZ_s1zEU4_AGYyiqCtk1zJvASOlrf7CbLPbRWNym2I7xXzeM-w6pIL5VEEhVwlX95f-PcuCRpVNHVCvvHXsG52VAnkK095w5oeD5Wo9ZB4e5GUZLI5RJBDKOLyEmXcddMzaB4lS4EpnFyKDwgDmALTaggwDYycO1gyubVkSMblxtSVxU';
export const WELCOME_BG_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDGlC0y_Xz7ws9fBk2enobNYh_8MeOC3_im9Vw1YDOlIopdHcUPp2vnWjDM9eJQVHfp81c_JtHXfmlRhS-QG1F2I5kvPJzHrcpVvurCwHS2KkFxHWBSSRgkYpdI47_fPMvqmFv75zYI3NQFSsYIcdc6dCZ8-7lBaTl4or6AswOuZ4_rBqfdADrYNchiUpNjt9KAZSdAcZrJjDAxo9Rv8hz2NouIh23-guUR9ZMazmHiio7YoqW-Gd_gEAcOcNW8ThyembA8056Yr2k';

export const INITIAL_LOCATION: UserLocation = {
  city: 'Mumbai',
  area: 'Indiranagar, Bangalore',
  isGPS: true,
};

export const POPULAR_CITIES = [
  'Jaipur',
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Pune',
  'Ahmedabad',
];

export const RECENT_LOCATIONS = [
  { area: 'Malviya Nagar', cityState: 'Jaipur, Rajasthan' },
  { area: 'Bandra West', cityState: 'Mumbai, Maharashtra' },
  { area: 'Koramangala', cityState: 'Bengaluru, Karnataka' },
];

export const MOCK_SALONS: Salon[] = [
  {
    id: 'aura-premium',
    name: 'Aura Premium Studio',
    area: '100ft Road',
    city: 'Bangalore',
    distanceKm: 1.2,
    rating: 4.9,
    reviewCount: 120,
    reviewsCount: 120,
    verified: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXNrkRfI9y_os1hhcj59fy20hKE4l0QqGUNQVn-XxClnWXAHhxsUq9StaxNDW-gVTqgRCTs4CRcDREHkDRl3O281WKov_60JM-vqbkQx2HFWfO7hqLgolrxEBjj4YuPr8wtWTvV7UvBSHcdo3tRzO_LrCzSCVWB6G_buJc_4YPh8LM_76wAGfy-QauOBGWykpt8KUDauq9kcOnmuvYaFU9Er-tKCssEugNxpC4_9MFMrErejr4RxpAFvlV13B_Jrs16yTwJhZbPFo',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXNrkRfI9y_os1hhcj59fy20hKE4l0QqGUNQVn-XxClnWXAHhxsUq9StaxNDW-gVTqgRCTs4CRcDREHkDRl3O281WKov_60JM-vqbkQx2HFWfO7hqLgolrxEBjj4YuPr8wtWTvV7UvBSHcdo3tRzO_LrCzSCVWB6G_buJc_4YPh8LM_76wAGfy-QauOBGWykpt8KUDauq9kcOnmuvYaFU9Er-tKCssEugNxpC4_9MFMrErejr4RxpAFvlV13B_Jrs16yTwJhZbPFo',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBU5ioD8ECJwIjxf7nL4GFiYyZkC5KS9Tg8KviIMZ4CQku5WLJ80Kw5gHfDNX25-h8BpHG7ERQfPqwDCPMBlrvja3Xupvm6LKWDVV41_kohsb0cvPH_cv51wS_UH7nIDqMz0FBSJOBjzLyOLHKhiZKO5v944i_9rLFRn4mKrb2WhYszYN2NVkwnK2Nb5RfeQVqjlr-qlwQ3_MJshmlX8Jh_40ZJZJEhNRF4GFrlbKvBt5hetyLuYpPLKfV6QZKXHnjN4Xp0viG_rmE',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBKjqHS__8pKWlHQ0Of3E1en-fZ_uPaluRnj_EcHI8HW7-6R2LvSOhQcijKHb2JQYglet-oxJ8Hu_RwNTv8SFK5ceJ8eBir2yMm1MhgA_laUQyPGxY6cz6YWIhOMFGE7kud32k81Nr9EIrexOLPo0oTRew5qiW7SWl7CTwTs9hWSTXArKuKJee_7o1oqJ6jz22o-DYlUb3CAsOrW-N3ZvBwHOvAppEv2ZTneVEaVI76gT32y-yGNASksxSfpP07R3nBV3etgqePX2Y',
    ],
    startingPrice: 899,
    tags: ['Hair Color', 'Balayage', 'Hair Spa'],
    genderCategory: 'Unisex',
    address: '42, 100ft Road, Indiranagar, Bangalore 560038',
    hours: '10:00 AM - 8:30 PM',
    description: 'Aura Premium Studio offers an ultra-luxurious hair and scalp experience. Featuring custom Balayage, organic Kerastase rituals, and tailored precision haircuts.',
    services: [
      { id: 'a1', name: "Woman's Haircut & Blowdry", durationMinutes: 45, price: 899, category: 'Hair Styling', description: 'Precision hair trim with customized styling and signature blowdry.' },
      { id: 'a2', name: 'Balayage & Toning', durationMinutes: 120, price: 3499, category: 'Hair Styling', description: 'Hand-painted sun-kissed highlights with premium gloss toner.' },
      { id: 'a3', name: 'Kerastase Elixir Hair Spa', durationMinutes: 60, price: 1899, category: 'Hair Spa', description: 'Deep nourishing ritual for smooth, lustrous locks.' },
      { id: 'a4', name: 'HydraGlow Facial Treatment', durationMinutes: 60, price: 2100, category: 'Skin Care', description: 'Infusion of hyaluronic serum for radiant glass skin.' },
    ],
    staff: [
      { id: 's1', name: 'Maya S.', role: 'Senior Stylist', rating: 4.9, reviewsCount: 84, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6FnEPu-SL4wCFVKcdUT8T3HAr4WTtQffHbnb-a1Q_KHmwlXmuuMexI_oX7VO3Ck7qecdPxZscnfPyNFROadrFDvlkX2aKpGC7DKv8u_kCOn8d2MGCISl3rqUL79jDHNAaMeiBfwgEUSzl-uZoz702Y0_08nr4fJCuUBFEAasK6fvfIalsfNsECYrq-GqF_jzTRNgR4lOYUXXnfcExQ5qPrfu7Tw6Sle-tPP-le3KXO-hb9dwZ-x-2wkRrIieKF0Y75ikYZ-xFPME' },
      { id: 's2', name: 'Rahul K.', role: 'Color Specialist', rating: 4.8, reviewsCount: 62, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAym-1XqNvvUES_juaNcLK1p8qid6RxJWHmLyEsIlb7AZSTPL3DCcTaY--lrpsKfwZwtjvl2FDo7LyVmLuDZb5KGoPI2DvOGefWFzVJnsIXTM2NkLwCvN_xGTXmI3_23Le-KpVYYx4qmB4kzK9QGaBpL0uNx2cigDOD6i19c0NbGXmLIMKy3m7bC9xhY50Odkqojhl7HF4nT9FrV_K_3UJKBBfiUTYnIcThOzvvmaz4DyrB8m0nL0W3-kL4DbP7Oyz_grSdxlUlWHQ' },
      { id: 's3', name: 'Zara M.', role: 'Esthetician', rating: 5.0, reviewsCount: 120, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9RAhukgBLye8hQOojgrb3bjsb6PQ_GhdMufuidFvlJqxVZ_xINH0Fdc1_s8l0aKXMACAyJMrQquxZKVQXPbcPnysxo2AAatGH3nEL1rVhgI_0bjqpB9KoTtaO7uJwL42BWgx9jqqZT8lTENQn-lR5HjKB-qPHz60CkRRmoz6LOby9AqVT6YTIEvV8qGyGrD_9L7ajxDuE2iRaPMw8FOg6RbQvHBxMhsSz267is5uVRucT7hdBBpbaVJ93mQq5R3csJlGGpBtEazk' },
    ],
  },
  {
    id: 'glam-room',
    name: 'The Glam Room',
    area: 'Bandra West',
    city: 'Mumbai',
    distanceKm: 1.2,
    rating: 4.9,
    reviewCount: 128,
    reviewsCount: 128,
    verified: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBU5ioD8ECJwIjxf7nL4GFiYyZkC5KS9Tg8KviIMZ4CQku5WLJ80Kw5gHfDNX25-h8BpHG7ERQfPqwDCPMBlrvja3Xupvm6LKWDVV41_kohsb0cvPH_cv51wS_UH7nIDqMz0FBSJOBjzLyOLHKhiZKO5v944i_9rLFRn4mKrb2WhYszYN2NVkwnK2Nb5RfeQVqjlr-qlwQ3_MJshmlX8Jh_40ZJZJEhNRF4GFrlbKvBt5hetyLuYpPLKfV6QZKXHnjN4Xp0viG_rmE',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBU5ioD8ECJwIjxf7nL4GFiYyZkC5KS9Tg8KviIMZ4CQku5WLJ80Kw5gHfDNX25-h8BpHG7ERQfPqwDCPMBlrvja3Xupvm6LKWDVV41_kohsb0cvPH_cv51wS_UH7nIDqMz0FBSJOBjzLyOLHKhiZKO5v944i_9rLFRn4mKrb2WhYszYN2NVkwnK2Nb5RfeQVqjlr-qlwQ3_MJshmlX8Jh_40ZJZJEhNRF4GFrlbKvBt5hetyLuYpPLKfV6QZKXHnjN4Xp0viG_rmE',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXNrkRfI9y_os1hhcj59fy20hKE4l0QqGUNQVn-XxClnWXAHhxsUq9StaxNDW-gVTqgRCTs4CRcDREHkDRl3O281WKov_60JM-vqbkQx2HFWfO7hqLgolrxEBjj4YuPr8wtWTvV7UvBSHcdo3tRzO_LrCzSCVWB6G_buJc_4YPh8LM_76wAGfy-QauOBGWykpt8KUDauq9kcOnmuvYaFU9Er-tKCssEugNxpC4_9MFMrErejr4RxpAFvlV13B_Jrs16yTwJhZbPFo',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBqhV0t5j__2UFAE_pYAATwrVVeuEo_35VQz8aItegXSp285ZOGugHYZnkRVTrRUKgMzzOLNjuuAKFwUaFUn8Ko1MSDyJG59ktfQGxwQ57XtjnikoWEEtEIq2zBFLglXZk2SdoSnnNVXm7iW7W446ICYYFJu-Op0WaK4UfUULDd_JcuGnb5N-4eUFDkFSw7-JcFpZ4NKsyRaaENuf2NYPKhBsQ-d06_dqmhcRFdfxzC3l1t3ADz_AiGTfMe-QKdNkn4QltKcX6L6Xc',
    ],
    startingPrice: 800,
    tags: ['Hair Styling', 'Creative Color', 'Keratin Spa'],
    genderCategory: 'Unisex',
    address: '14/A Waterfield Road, Bandra West, Mumbai, Maharashtra 400050',
    hours: '10:00 AM - 8:00 PM',
    description: 'The Glam Room is a premium sanctuary for modern beauty. We specialize in bespoke haircuts, advanced coloring techniques, and rejuvenating skin treatments using top-tier international products.',
    services: [
      { id: 'g1', name: "Woman's Haircut", durationMinutes: 45, price: 800, category: 'Hair Styling', description: 'Senior Stylist precision haircut, wash and customized styling.' },
      { id: 'g2', name: 'Creative Coloring', durationMinutes: 120, price: 2500, category: 'Hair Styling', description: 'Vibrant highlight gloss or custom dimensional color tint. Includes wash.' },
      { id: 'g3', name: 'Keratin Treatment', durationMinutes: 90, price: 4200, category: 'Spa & Care', description: 'Intensive smoothing treatment using premium formaldehyde-free keratin.' },
      { id: 'g4', name: 'Signature Gel Manicure', durationMinutes: 45, price: 1200, category: 'Nails', description: 'Long-lasting high-shine polish with cuticle detox massage.' },
    ],
    staff: [
      { id: 's1', name: 'Maya S.', role: 'Senior Stylist', rating: 4.9, reviewsCount: 84, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6FnEPu-SL4wCFVKcdUT8T3HAr4WTtQffHbnb-a1Q_KHmwlXmuuMexI_oX7VO3Ck7qecdPxZscnfPyNFROadrFDvlkX2aKpGC7DKv8u_kCOn8d2MGCISl3rqUL79jDHNAaMeiBfwgEUSzl-uZoz702Y0_08nr4fJCuUBFEAasK6fvfIalsfNsECYrq-GqF_jzTRNgR4lOYUXXnfcExQ5qPrfu7Tw6Sle-tPP-le3KXO-hb9dwZ-x-2wkRrIieKF0Y75ikYZ-xFPME' },
      { id: 's2', name: 'Rahul K.', role: 'Color Specialist', rating: 4.8, reviewsCount: 62, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAym-1XqNvvUES_juaNcLK1p8qid6RxJWHmLyEsIlb7AZSTPL3DCcTaY--lrpsKfwZwtjvl2FDo7LyVmLuDZb5KGoPI2DvOGefWFzVJnsIXTM2NkLwCvN_xGTXmI3_23Le-KpVYYx4qmB4kzK9QGaBpL0uNx2cigDOD6i19c0NbGXmLIMKy3m7bC9xhY50Odkqojhl7HF4nT9FrV_K_3UJKBBfiUTYnIcThOzvvmaz4DyrB8m0nL0W3-kL4DbP7Oyz_grSdxlUlWHQ' },
      { id: 's3', name: 'Zara M.', role: 'Esthetician', rating: 5.0, reviewsCount: 120, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9RAhukgBLye8hQOojgrb3bjsb6PQ_GhdMufuidFvlJqxVZ_xINH0Fdc1_s8l0aKXMACAyJMrQquxZKVQXPbcPnysxo2AAatGH3nEL1rVhgI_0bjqpB9KoTtaO7uJwL42BWgx9jqqZT8lTENQn-lR5HjKB-qPHz60CkRRmoz6LOby9AqVT6YTIEvV8qGyGrD_9L7ajxDuE2iRaPMw8FOg6RbQvHBxMhsSz267is5uVRucT7hdBBpbaVJ93mQq5R3csJlGGpBtEazk' },
    ],
  },
  {
    id: 'lumiere-studio',
    name: 'Lumière Studio',
    area: 'Bandra West',
    city: 'Mumbai',
    distanceKm: 1.2,
    rating: 4.8,
    reviewCount: 96,
    reviewsCount: 96,
    verified: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKjqHS__8pKWlHQ0Of3E1en-fZ_uPaluRnj_EcHI8HW7-6R2LvSOhQcijKHb2JQYglet-oxJ8Hu_RwNTv8SFK5ceJ8eBir2yMm1MhgA_laUQyPGxY6cz6YWIhOMFGE7kud32k81Nr9EIrexOLPo0oTRew5qiW7SWl7CTwTs9hWSTXArKuKJee_7o1oqJ6jz22o-DYlUb3CAsOrW-N3ZvBwHOvAppEv2ZTneVEaVI76gT32y-yGNASksxSfpP07R3nBV3etgqePX2Y',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBKjqHS__8pKWlHQ0Of3E1en-fZ_uPaluRnj_EcHI8HW7-6R2LvSOhQcijKHb2JQYglet-oxJ8Hu_RwNTv8SFK5ceJ8eBir2yMm1MhgA_laUQyPGxY6cz6YWIhOMFGE7kud32k81Nr9EIrexOLPo0oTRew5qiW7SWl7CTwTs9hWSTXArKuKJee_7o1oqJ6jz22o-DYlUb3CAsOrW-N3ZvBwHOvAppEv2ZTneVEaVI76gT32y-yGNASksxSfpP07R3nBV3etgqePX2Y',
    ],
    startingPrice: 1500,
    tags: ['Unisex', 'Kerastase Spa', 'Moroccan Oil'],
    genderCategory: 'Unisex',
    address: '88, Turner Road, Bandra West, Mumbai, Maharashtra 400050',
    hours: '10:00 AM - 9:00 PM',
    description: 'French minimalist aesthetic studio offering bespoke Moroccan Oil massages, advanced scalp rejuvenation, and couture hair transformations.',
    services: [
      { id: 'l1', name: 'Kerastase Hair Spa', durationMinutes: 60, price: 1500, category: 'Hair Spa', description: 'Intensive scalp detox and strand smoothing.' },
      { id: 'l2', name: 'Classic Manicure', durationMinutes: 30, price: 650, category: 'Nails', description: 'Cuticle shaping, gentle scrub, and nail polish application.' },
      { id: 'l3', name: 'Moroccan Oil Treatment', durationMinutes: 75, price: 2200, category: 'Hair Spa', description: 'Pure argan oil massage and steam therapy.' },
    ],
    staff: [
      { id: 's1', name: 'Maya S.', role: 'Senior Stylist', rating: 4.9, reviewsCount: 84, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6FnEPu-SL4wCFVKcdUT8T3HAr4WTtQffHbnb-a1Q_KHmwlXmuuMexI_oX7VO3Ck7qecdPxZscnfPyNFROadrFDvlkX2aKpGC7DKv8u_kCOn8d2MGCISl3rqUL79jDHNAaMeiBfwgEUSzl-uZoz702Y0_08nr4fJCuUBFEAasK6fvfIalsfNsECYrq-GqF_jzTRNgR4lOYUXXnfcExQ5qPrfu7Tw6Sle-tPP-le3KXO-hb9dwZ-x-2wkRrIieKF0Y75ikYZ-xFPME' },
    ],
  },
  {
    id: 'derma-glow',
    name: 'DermaGlow Clinic',
    area: 'CMH Road',
    city: 'Bangalore',
    distanceKm: 2.5,
    rating: 4.7,
    reviewCount: 45,
    reviewsCount: 45,
    verified: true,
    isNew: true,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqhV0t5j__2UFAE_pYAATwrVVeuEo_35VQz8aItegXSp285ZOGugHYZnkRVTrRUKgMzzOLNjuuAKFwUaFUn8Ko1MSDyJG59ktfQGxwQ57XtjnikoWEEtEIq2zBFLglXZk2SdoSnnNVXm7iW7W446ICYYFJu-Op0WaK4UfUULDd_JcuGnb5N-4eUFDkFSw7-JcFpZ4NKsyRaaENuf2NYPKhBsQ-d06_dqmhcRFdfxzC3l1t3ADz_AiGTfMe-QKdNkn4QltKcX6L6Xc',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBqhV0t5j__2UFAE_pYAATwrVVeuEo_35VQz8aItegXSp285ZOGugHYZnkRVTrRUKgMzzOLNjuuAKFwUaFUn8Ko1MSDyJG59ktfQGxwQ57XtjnikoWEEtEIq2zBFLglXZk2SdoSnnNVXm7iW7W446ICYYFJu-Op0WaK4UfUULDd_JcuGnb5N-4eUFDkFSw7-JcFpZ4NKsyRaaENuf2NYPKhBsQ-d06_dqmhcRFdfxzC3l1t3ADz_AiGTfMe-QKdNkn4QltKcX6L6Xc',
    ],
    startingPrice: 1499,
    tags: ['Hydrafacial', 'Peels', 'Dermatology'],
    genderCategory: 'Unisex',
    address: '102, CMH Road, Indiranagar, Bangalore 560038',
    hours: '10:30 AM - 7:30 PM',
    description: 'Clinical skin therapy studio led by certified dermatologists. Hydro-dermabrasion, light therapy, and anti-aging peel solutions.',
    services: [
      { id: 'd1', name: 'Clinical Hydrafacial 3D', durationMinutes: 60, price: 2999, category: 'Skin Care', description: 'Pore extraction, diamond tip abrasion, hyaluronic serum injection.' },
      { id: 'd2', name: 'Radiance Chemical Peel', durationMinutes: 45, price: 1499, category: 'Skin Care', description: 'Gentle glycolic rejuvenation for instant brightness.' },
    ],
    staff: [
      { id: 's3', name: 'Zara M.', role: 'Lead Esthetician', rating: 5.0, reviewsCount: 120, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9RAhukgBLye8hQOojgrb3bjsb6PQ_GhdMufuidFvlJqxVZ_xINH0Fdc1_s8l0aKXMACAyJMrQquxZKVQXPbcPnysxo2AAatGH3nEL1rVhgI_0bjqpB9KoTtaO7uJwL42BWgx9jqqZT8lTENQn-lR5HjKB-qPHz60CkRRmoz6LOby9AqVT6YTIEvV8qGyGrD_9L7ajxDuE2iRaPMw8FOg6RbQvHBxMhsSz267is5uVRucT7hdBBpbaVJ93mQq5R3csJlGGpBtEazk' },
    ],
  },
  {
    id: 'hive-salon',
    name: 'The Hive Salon',
    area: 'Khar West',
    city: 'Mumbai',
    distanceKm: 2.5,
    rating: 4.6,
    reviewCount: 78,
    reviewsCount: 78,
    verified: false,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRM-yy6OnbhOFhZAmgbO5Bm_QrPNOwqdj9ZcphuYvSUbw8Mib0fdO6cdWjt-o80qBuG_zE0iRFTIvBhPpbR85jKoWtVyGDo-5CJSjrMUe6RT0qENN-sc6DPKe8ClliS4oUM9j18gEf6WCkg6KTkEht-x5lqRZP4-5MqysbqXLlLuYp7Sd-RYTbYMQcyAjhnhTGbeI7MImTskPu9qZ4FKBsrczSbLIUZ7_UdpK3kNX4VSiqefXp_Jj88KN-29TzfOIV1LH9L3-_0zg',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCRM-yy6OnbhOFhZAmgbO5Bm_QrPNOwqdj9ZcphuYvSUbw8Mib0fdO6cdWjt-o80qBuG_zE0iRFTIvBhPpbR85jKoWtVyGDo-5CJSjrMUe6RT0qENN-sc6DPKe8ClliS4oUM9j18gEf6WCkg6KTkEht-x5lqRZP4-5MqysbqXLlLuYp7Sd-RYTbYMQcyAjhnhTGbeI7MImTskPu9qZ4FKBsrczSbLIUZ7_UdpK3kNX4VSiqefXp_Jj88KN-29TzfOIV1LH9L3-_0zg',
    ],
    startingPrice: 1200,
    tags: ['Women Only', 'Olaplex Spa', 'Aromatherapy'],
    genderCategory: 'Women Only',
    address: '5th Road, Khar West, Mumbai, Maharashtra 400052',
    hours: '11:00 AM - 8:00 PM',
    description: 'An eco-friendly women-only boutique salon surrounded by lush botanical elements. Organic color lines and Olaplex hair bonding.',
    services: [
      { id: 'h1', name: 'Olaplex Repair Spa', durationMinutes: 60, price: 1200, category: 'Hair Spa', description: 'Bond building system to restore damaged protein bonds.' },
      { id: 'h2', name: 'Aromatherapy Facial', durationMinutes: 50, price: 1600, category: 'Skin Care', description: 'Essential oils massage for stress relief and skin hydration.' },
    ],
    staff: [
      { id: 's1', name: 'Maya S.', role: 'Senior Stylist', rating: 4.9, reviewsCount: 84, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6FnEPu-SL4wCFVKcdUT8T3HAr4WTtQffHbnb-a1Q_KHmwlXmuuMexI_oX7VO3Ck7qecdPxZscnfPyNFROadrFDvlkX2aKpGC7DKv8u_kCOn8d2MGCISl3rqUL79jDHNAaMeiBfwgEUSzl-uZoz702Y0_08nr4fJCuUBFEAasK6fvfIalsfNsECYrq-GqF_jzTRNgR4lOYUXXnfcExQ5qPrfu7Tw6Sle-tPP-le3KXO-hb9dwZ-x-2wkRrIieKF0Y75ikYZ-xFPME' },
    ],
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-99',
    salonId: 'aura-premium',
    salonName: 'Aura Premium Salon',
    services: [
      { id: 'a1', name: "Woman's Haircut & Blowdry", durationMinutes: 45, price: 899, category: 'Hair Styling' },
    ],
    totalAmount: 899,
    dateStr: 'Sun, 21 Jul',
    timeSlot: '03:00 PM',
    status: 'COMPLETED',
    staffName: 'Maya S.',
    locationArea: 'Indiranagar, Bangalore',
    createdTime: Date.now() - 345600000,
    isReviewed: false,
  },
  {
    id: 'bk-101',
    salonId: 'aura-premium',
    salonName: 'Aura Premium Salon',
    services: [
      { id: 'a2', name: 'Balayage & Styling', durationMinutes: 120, price: 3499, category: 'Hair Styling' },
    ],
    totalAmount: 3499,
    dateStr: 'Sat, 28 Jul',
    timeSlot: '11:00 AM',
    status: 'CONFIRMED',
    staffName: 'Maya S.',
    locationArea: 'Indiranagar, Bangalore',
    createdTime: Date.now() - 86400000,
  },
  {
    id: 'bk-102',
    salonId: 'lumiere-studio',
    salonName: 'Lumiere Studio',
    services: [
      { id: 'l2', name: 'Classic Manicure', durationMinutes: 30, price: 650, category: 'Nails' },
    ],
    totalAmount: 650,
    dateStr: 'Tue, 15 Aug',
    timeSlot: '2:30 PM',
    status: 'PENDING',
    staffName: 'Zara M.',
    locationArea: 'Bandra West, Mumbai',
    createdTime: Date.now() - 43200000,
  },
];
