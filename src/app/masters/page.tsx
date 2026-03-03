"use client";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SERVICE_COLORS } from "@/lib/constants";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  code: string;
  products: Product[];
}

export default function MastersPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Add service state
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceCode, setNewServiceCode] = useState("");
  const [addServiceError, setAddServiceError] = useState("");
  const [addingService, setAddingService] = useState(false);

  // Edit service state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editServiceName, setEditServiceName] = useState("");
  const [editServiceError, setEditServiceError] = useState("");

  // Add product state (keyed by serviceId)
  const [addingProductTo, setAddingProductTo] = useState<string | null>(null);
  const [newProductName, setNewProductName] = useState("");
  const [addProductError, setAddProductError] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/masters");
    const data = await res.json();
    setServices(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAddService() {
    setAddServiceError("");
    if (!newServiceName.trim() || !newServiceCode.trim()) {
      setAddServiceError("Both name and code are required");
      return;
    }
    setAddingService(true);
    const res = await fetch("/api/masters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newServiceName.trim(), code: newServiceCode.trim().toUpperCase() }),
    });
    setAddingService(false);
    if (!res.ok) {
      const json = await res.json();
      setAddServiceError(json.error || "Failed to add service");
      return;
    }
    setNewServiceName("");
    setNewServiceCode("");
    setShowAddService(false);
    load();
  }

  async function handleRenameService(id: string) {
    setEditServiceError("");
    if (!editServiceName.trim()) { setEditServiceError("Name is required"); return; }
    const res = await fetch(`/api/masters/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editServiceName.trim() }),
    });
    if (!res.ok) {
      const json = await res.json();
      setEditServiceError(json.error || "Failed to rename");
      return;
    }
    setEditingServiceId(null);
    load();
  }

  async function handleDeleteService(id: string, name: string) {
    if (!confirm(`Delete service "${name}"? All its products will also be deleted.`)) return;
    const res = await fetch(`/api/masters/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "Failed to delete service");
      return;
    }
    load();
  }

  async function handleAddProduct(serviceId: string) {
    setAddProductError("");
    if (!newProductName.trim()) { setAddProductError("Product name is required"); return; }
    setSavingProduct(true);
    const res = await fetch("/api/masters/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId, name: newProductName.trim() }),
    });
    setSavingProduct(false);
    if (!res.ok) {
      const json = await res.json();
      setAddProductError(json.error || "Failed to add product");
      return;
    }
    setNewProductName("");
    setAddingProductTo(null);
    load();
  }

  async function handleDeleteProduct(productId: string, productName: string) {
    if (!confirm(`Delete product "${productName}"?`)) return;
    const res = await fetch(`/api/masters/products/${productId}`, { method: "DELETE" });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "Failed to delete product");
      return;
    }
    load();
  }

  return (
    <>
      <Header title="Masters" subtitle="Manage services and products" />
      <div className="p-6 space-y-6">
        {/* Add Service */}
        <div className="flex items-start gap-4">
          {showAddService ? (
            <div className="flex flex-col gap-2 bg-slate-800 border border-slate-700 rounded-lg p-4 w-full max-w-md">
              <p className="text-sm font-medium text-slate-200">New Service</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Service name (e.g. Health Insurance)"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Code (e.g. HEALTH)"
                  value={newServiceCode}
                  onChange={(e) => setNewServiceCode(e.target.value.toUpperCase())}
                  className="w-32 uppercase"
                  maxLength={10}
                />
              </div>
              {addServiceError && <p className="text-xs text-red-400">{addServiceError}</p>}
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddService} disabled={addingService}>
                  {addingService ? "Adding..." : "Add Service"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setShowAddService(false); setAddServiceError(""); setNewServiceName(""); setNewServiceCode(""); }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowAddService(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Add Service
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full border text-sm font-medium flex-shrink-0 ${SERVICE_COLORS[service.code] || "bg-gray-800 text-gray-300 border-gray-600"}`}>
                      {service.code}
                    </span>

                    {editingServiceId === service.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editServiceName}
                          onChange={(e) => setEditServiceName(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === "Enter") handleRenameService(service.id); if (e.key === "Escape") setEditingServiceId(null); }}
                        />
                        <button onClick={() => handleRenameService(service.id)} className="text-green-400 hover:text-green-300" title="Save">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setEditingServiceId(null); setEditServiceError(""); }} className="text-slate-400 hover:text-slate-300" title="Cancel">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="flex-1 text-slate-100">{service.name}</span>
                    )}

                    {editingServiceId !== service.id && (
                      <div className="flex gap-1 ml-auto">
                        <button
                          onClick={() => { setEditingServiceId(service.id); setEditServiceName(service.name); setEditServiceError(""); }}
                          className="text-slate-400 hover:text-slate-200 p-1 rounded"
                          title="Rename service"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id, service.name)}
                          className="text-slate-400 hover:text-red-400 p-1 rounded"
                          title="Delete service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </CardTitle>
                  {editServiceError && editingServiceId === service.id && (
                    <p className="text-xs text-red-400 mt-1">{editServiceError}</p>
                  )}
                </CardHeader>

                <CardContent>
                  {/* Product list */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {service.products.map((product) => (
                      <span
                        key={product.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-600 text-sm text-slate-300 bg-slate-800"
                      >
                        {product.name}
                        <button
                          onClick={() => handleDeleteProduct(product.id, product.name)}
                          className="text-slate-500 hover:text-red-400 ml-0.5"
                          title={`Delete ${product.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add product */}
                  {addingProductTo === service.id ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Product name"
                          value={newProductName}
                          onChange={(e) => setNewProductName(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                          onKeyDown={(e) => { if (e.key === "Enter") handleAddProduct(service.id); if (e.key === "Escape") { setAddingProductTo(null); setNewProductName(""); } }}
                        />
                        <Button size="sm" className="h-8" onClick={() => handleAddProduct(service.id)} disabled={savingProduct}>
                          <Check className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => { setAddingProductTo(null); setNewProductName(""); setAddProductError(""); }}>
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      {addProductError && <p className="text-xs text-red-400">{addProductError}</p>}
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingProductTo(service.id); setNewProductName(""); setAddProductError(""); }}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 mt-1"
                    >
                      <Plus className="w-3 h-3" /> Add product
                    </button>
                  )}

                  <p className="text-xs text-slate-500 mt-3">{service.products.length} product{service.products.length !== 1 ? "s" : ""}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
