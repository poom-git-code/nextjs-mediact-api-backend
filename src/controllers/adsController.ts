import { Context } from "koa";
import * as AdsService from "../services/adsService";
import { createAdsSchema, editAdsSchema } from "../validations/adsValidation";
import Joi from "joi";

export const getAdsImages = async (ctx: Context) => {
  const adsImages = [
    // {
    //   imageUrl:
    //     "https://mediact.sgp1.cdn.digitaloceanspaces.com/ads/banner_mobile_resized.png",
    //   imageLink: "https://msc.healthcare",
    // },
    {
      imageUrl:
        "https://mediact-public-assets.sgp1.cdn.digitaloceanspaces.com/messageImage_1749135336540.jpg",
      imageLink:
        "https://shopee.co.th/edview_thailand?uls_trackid=52sq8v4j0048&utm_content=sUjDQRr9uQ8EUxewKZJ5sKuigYP",
    },
    // { imageUrl: 'https://mediact-public-assets.sgp1.cdn.digitaloceanspaces.com/Screenshot%202568-06-05%20at%2021.17.29.png', imageLink: '' },
    {
      imageUrl:
        "https://mediact-public-assets.sgp1.cdn.digitaloceanspaces.com/Screenshot%202568-06-05%20at%2021.16.39.png",
      imageLink: "https://forms.gle/57hU9nHZUxCu1ZE69",
    },
    // {
    //   imageUrl:
    //     "https://mediact.sgp1.cdn.digitaloceanspaces.com/ads/BC_PET_SUPPLIES_mobile_width.png",
    //   imageLink: "https://bcpetsupplies.com/",
    // },
    {
      imageUrl:
        "https://mediact.sgp1.cdn.digitaloceanspaces.com/ads/App%20Banner.jpg",
      imageLink: "https://www.indmoodforherb.com/",
    },
    {
      imageUrl:
        "https://mediact.sgp1.cdn.digitaloceanspaces.com/ads/surgi-care%20BANNER%202%20(1).png",
      imageLink: "https://drive.google.com/file/d/1YC7WqX4UhDwL-mgLpXrBWFajbV9YkBUr/view?usp=drivesdk",
    },
  ];

  // สุ่มลำดับ (Fisher-Yates shuffle)
  for (let i = adsImages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [adsImages[i], adsImages[j]] = [adsImages[j], adsImages[i]];
  }

  ctx.body = { adsImages };
};

// export const getAdsImages = async (ctx: Context) => {
//   const adsImages = [
//     {
//       imageUrl:
//         "https://mediact.sgp1.cdn.digitaloceanspaces.com/static/56565620-433F-4BA9-91EB-BFE059F726B8.png",
//       imageLink: "https://mediact.biz",
//     },
//   ];

//   // สุ่มลำดับ (Fisher-Yates shuffle)
//   for (let i = adsImages.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [adsImages[i], adsImages[j]] = [adsImages[j], adsImages[i]];
//   }

//   ctx.body = { adsImages };
// };

export const getAdsImagesBig = async (ctx: Context) => {
  const adsImagesBig = [
    {
      imageUrl:
        "https://mediact.sgp1.cdn.digitaloceanspaces.com/ads/Bigtest-1.jpg",
      imageLink: "https://msc.healthcare",
    },
    {
      imageUrl:
        "https://mediact.sgp1.cdn.digitaloceanspaces.com/ads/Bigtest-2.png",
      imageLink: "https://msc.healthcare",
    },
    {
      imageUrl:
        "https://mediact.sgp1.cdn.digitaloceanspaces.com/ads/logo-bc-pet-supplies-e1741950805617-1024x564.png",
      imageLink: "https://bcpetsupplies.com",
    },
  ];
  ctx.body = { adsImagesBig };
};

export const createAd = async (ctx: Context) => {
  const { error } = createAdsSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userId = ctx.state.user?.id;
    // console.log('Decoded userId:', userId);
    const ad = await AdsService.createAd(ctx.request.body, userId);
    // ctx.status = 201;
    ctx.body = { message: "Ad created successfully", ad };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const updateAd = async (ctx: Context) => {
  const { id } = ctx.params;
  const { error, value } = editAdsSchema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { error: error.details[0].message };
    return;
  }

  try {
    const userId = ctx.state.user?.id;
    const updatedAd = await AdsService.updateAd(
      parseInt(id, 10),
      value,
      userId
    );
    ctx.body = { message: "Ad updated successfully", updatedAd };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const deleteAd = async (ctx: Context) => {
  try {
    const userId = ctx.state.user?.id;
    await AdsService.deleteAd(parseInt(ctx.params.id), userId);
    ctx.body = { message: "Ad deactivated successfully" };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

export const getAdById = async (ctx: Context) => {
  const { id } = ctx.params;

  try {
    const ad = await AdsService.getAdById(parseInt(id, 10));
    ctx.body = { ad };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};

// export const getAdInfo = async (ctx: Context) => {
//   const adId = ctx.state.ad.id;

//   try {
//     const ad = await AdsService.getAdInfo(adId);
//     ctx.body = { ad };
//   } catch (error) {
//     ctx.status = 400;
//     if (error instanceof Joi.ValidationError) {
//       ctx.body = { error: error.details[0].message };
//     } else if (error instanceof Error) {
//       ctx.body = { error: error.message };
//     } else {
//       ctx.body = { error: "Unknown error occurred" };
//     }
//   }
// };

export const getAllAds = async (ctx: Context) => {
  try {
    const ads = await AdsService.getAllAds();
    ctx.body = { ads };
  } catch (error) {
    ctx.status = 400;
    if (error instanceof Joi.ValidationError) {
      ctx.body = { error: error.details[0].message };
    } else if (error instanceof Error) {
      ctx.body = { error: error.message };
    } else {
      ctx.body = { error: "Unknown error occurred" };
    }
  }
};
