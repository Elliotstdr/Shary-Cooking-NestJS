-- DropForeignKey
ALTER TABLE "ingredient" DROP CONSTRAINT "ingredient_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "step" DROP CONSTRAINT "step_recipeId_fkey";

-- AddForeignKey
ALTER TABLE "step" ADD CONSTRAINT "step_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient" ADD CONSTRAINT "ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
