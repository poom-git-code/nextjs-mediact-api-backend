import { Context } from "koa";
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  activateBrand,
  searchBrands,
} from "../services/brandsService";

// GET /brands - Get all brands
export const listBrands = async (ctx: Context) => {
  try {
    const language = ctx.state.language || "th";
    const activeOnly = ctx.query.active === "true" || ctx.query.active === "1";
    
    const brands = await getAllBrands(language, activeOnly);
    
    ctx.body = {
      success: true,
      data: brands,
      count: brands.length,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: "Failed to fetch brands",
      details: (error as Error).message,
    };
  }
};

// GET /brands/:id - Get brand by ID
export const getBrand = async (ctx: Context) => {
  try {
    const id = Number(ctx.params.id);
    const language = ctx.state.language || "th";

    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: "Invalid brand ID",
      };
      return;
    }

    const brand = await getBrandById(id, language);

    if (!brand) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: "Brand not found",
      };
      return;
    }

    ctx.body = {
      success: true,
      data: brand,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: "Failed to fetch brand",
      details: (error as Error).message,
    };
  }
};

// POST /brands - Create new brand
export const createBrandController = async (ctx: Context) => {
  try {
    const { name_th, name_en, logo_url, is_active } = ctx.request.body as any;

    if (!name_th) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: "name_th is required",
      };
      return;
    }

    const brand = await createBrand({
      name_th,
      name_en,
      logo_url,
      is_active,
    });

    ctx.status = 201;
    ctx.body = {
      success: true,
      message: "Brand created successfully",
      data: brand,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: "Failed to create brand",
      details: (error as Error).message,
    };
  }
};

// PATCH /brands/:id - Update brand
export const updateBrandController = async (ctx: Context) => {
  try {
    const id = Number(ctx.params.id);
    const { name_th, name_en, logo_url, is_active } = ctx.request.body as any;

    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: "Invalid brand ID",
      };
      return;
    }

    const brand = await updateBrand(id, {
      name_th,
      name_en,
      logo_url,
      is_active,
    });

    ctx.body = {
      success: true,
      message: "Brand updated successfully",
      data: brand,
    };
  } catch (error) {
    if ((error as Error).message === "Brand not found") {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: "Brand not found",
      };
      return;
    }

    ctx.status = 500;
    ctx.body = {
      success: false,
      error: "Failed to update brand",
      details: (error as Error).message,
    };
  }
};

// DELETE /brands/:id - Delete brand
export const deleteBrandController = async (ctx: Context) => {
  try {
    const id = Number(ctx.params.id);
    const hardDelete = ctx.query.hard === "true" || ctx.query.hard === "1";

    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: "Invalid brand ID",
      };
      return;
    }

    const result = await deleteBrand(id, hardDelete);

    ctx.body = {
      success: true,
      message: result.message,
    };
  } catch (error) {
    if ((error as Error).message === "Brand not found") {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: "Brand not found",
      };
      return;
    }

    ctx.status = 500;
    ctx.body = {
      success: false,
      error: "Failed to delete brand",
      details: (error as Error).message,
    };
  }
};

// POST /brands/:id/activate - Activate brand
export const activateBrandController = async (ctx: Context) => {
  try {
    const id = Number(ctx.params.id);

    if (isNaN(id)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: "Invalid brand ID",
      };
      return;
    }

    const brand = await activateBrand(id);

    ctx.body = {
      success: true,
      message: "Brand activated successfully",
      data: brand,
    };
  } catch (error) {
    if ((error as Error).message === "Brand not found") {
      ctx.status = 404;
      ctx.body = {
        success: false,
        error: "Brand not found",
      };
      return;
    }

    ctx.status = 500;
    ctx.body = {
      success: false,
      error: "Failed to activate brand",
      details: (error as Error).message,
    };
  }
};

// GET /brands/search - Search brands
export const searchBrandsController = async (ctx: Context) => {
  try {
    const query = ctx.query.q as string;
    const language = ctx.state.language || "th";
    const activeOnly = ctx.query.active !== "false" && ctx.query.active !== "0";

    if (!query || query.trim() === "") {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: "Search query is required",
      };
      return;
    }

    const brands = await searchBrands(query, language, activeOnly);

    ctx.body = {
      success: true,
      data: brands,
      count: brands.length,
      query,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: "Failed to search brands",
      details: (error as Error).message,
    };
  }
};
