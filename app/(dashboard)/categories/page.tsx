import { deleteCategory } from "@/lib/actions/categories";
import { CategoryForm } from "@/components/forms/category-form";
import { Topbar } from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { getCategories } from "@/lib/data";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <Topbar title="Categories" />
      <div className="grid gap-6 p-4 md:p-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardTitle>Create Category</CardTitle>
          <div className="mt-4">
            <CategoryForm />
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <CardTitle>Your Categories</CardTitle>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {categories.map((category) => (
              <div key={category.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <p className="font-medium">{category.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{category.icon}</p>
                </div>
                <form
                  className="mt-3"
                  action={async () => {
                    "use server";
                    const formData = new FormData();
                    formData.set("id", category.id);
                    await deleteCategory(formData);
                  }}
                >
                  <Button type="submit" size="sm" variant="danger">
                    Delete
                  </Button>
                </form>
              </div>
            ))}
            {categories.length === 0 ? <p className="text-sm text-muted-foreground">No categories yet.</p> : null}
          </div>
        </Card>
      </div>
    </>
  );
}

