"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Flame, CheckCircle, XCircle, Trash2, Download, LogOut,
  Clock, Eye, Users, Briefcase, RefreshCw, Search,
  ChevronDown, MapPin, Building2,
} from "lucide-react";
import { getProjectType } from "@/lib/constants";

interface Job {
  id: string; status: string; jobTitle: string; companyName: string;
  location: string; projectType: string; currency: string; salary: string;
  experience: string; qualification: string; imageUrl: string | null;
  postType: string; viewCount: number; createdAt: string; approvedAt: string | null;
  _count?: { applications: number };
}
type Tab = "pending" | "approved" | "rejected" | "all";

export default function AdminDashboard() {
  const router = useRouter();
  const [jobs,   setJobs]   = useState<Job[]>([]);
  const [loading,setLoading]= useState(true);
  const [tab,    setTab]    = useState<Tab>("pending");
  const [search, setSearch] = useState("");
  const [busy,   setBusy]   = useState<string|null>(null);
  const [open,   setOpen]   = useState<string|null>(null);

  const load = useCallback(async (t: Tab) => {
    setLoading(true);
    const r = await fetch(`/api/admin/jobs?status=${t}`, { credentials:"include" });
    if (r.status===401) { router.push("/admin"); return; }
    setJobs(await r.json());
    setLoading(false);
  }, [router]);

  useEffect(() => { load(tab); }, [tab, load]);

  const act = async (id: string, key: string, fn: ()=>Promise<void>) => {
    setBusy(`${id}-${key}`); try { await fn(); await load(tab); } finally { setBusy(null); }
  };
  const approve = (id:string) => act(id,"ap",()=>fetch(`/api/admin/jobs/${id}/approve`,{method:"PUT",credentials:"include"}).then(()=>{}));
  const reject  = (id:string) => { if(!confirm("Reject?")) return; act(id,"rj",()=>fetch(`/api/admin/jobs/${id}/reject`,{method:"PUT",credentials:"include"}).then(()=>{})); };
  const del     = (id:string) => { if(!confirm("Delete permanently?")) return; act(id,"dl",()=>fetch(`/api/admin/jobs/${id}`,{method:"DELETE",credentials:"include"}).then(()=>{})); };
  const logout  = async () => { await fetch("/api/admin/logout",{method:"POST"}); router.push("/admin"); };

  const filtered = jobs.filter(j=>
    j.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
    j.companyName.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    all:jobs.length,
    pending: jobs.filter(j=>j.status==="pending").length,
    approved:jobs.filter(j=>j.status==="approved").length,
    rejected:jobs.filter(j=>j.status==="rejected").length,
  };

  const TABS: {key:Tab;label:string;color:string}[] = [
    {key:"pending", label:"Pending",  color:"#F59E0B"},
    {key:"approved",label:"Live",     color:"#42B72A"},
    {key:"rejected",label:"Rejected", color:"#F44336"},
    {key:"all",     label:"All Posts",color:"var(--fb-blue)"},
  ];

  const StatCard = ({label,value,icon:Icon,color}:{label:string;value:number;icon:React.ElementType;color:string})=>(
    <div className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{border:"1px solid var(--fb-border)",boxShadow:"0 1px 2px rgba(0,0,0,.08)"}}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{background:color+"18"}}>
        <Icon className="w-5 h-5" style={{color}} />
      </div>
      <div>
        <p className="font-extrabold text-2xl leading-none">{value}</p>
        <p className="text-xs mt-0.5" style={{color:"var(--fb-secondary)"}}>{label}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-[56px] pb-24 md:pb-0" style={{background:"var(--fb-bg)"}}>

      {/* Sub-header */}
      <div className="bg-white sticky top-[56px] z-30 px-4 py-2 flex items-center justify-between gap-3" style={{borderBottom:"1px solid var(--fb-border)",boxShadow:"0 1px 2px rgba(0,0,0,.08)"}}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{background:"var(--fb-blue)"}}>
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">Admin Dashboard</p>
            <p className="text-[11px] leading-none mt-0.5" style={{color:"var(--fb-secondary)"}}>Gulf-Rig</p>
          </div>
        </div>
        <div className="flex gap-2">
          <a href="/api/admin/export" target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
            style={{background:"var(--fb-bg)",color:"var(--fb-secondary)",border:"1px solid var(--fb-border)"}}>
            <Download className="w-3.5 h-3.5" /><span className="hidden md:inline">Export CSV</span>
          </a>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{background:"#FFF0F0",color:"#F44336",border:"1px solid #FFCDD2"}}>
            <LogOut className="w-3.5 h-3.5" /><span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 py-4 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Posts"    value={counts.all}      icon={Briefcase}   color="var(--fb-blue)" />
          <StatCard label="Pending Review" value={counts.pending}  icon={Clock}       color="#F59E0B" />
          <StatCard label="Live Jobs"      value={counts.approved} icon={CheckCircle} color="#42B72A" />
          <StatCard label="Rejected"       value={counts.rejected} icon={XCircle}     color="#F44336" />
        </div>

        {/* Tabs + search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-0 bg-white rounded-xl overflow-hidden" style={{border:"1px solid var(--fb-border)",boxShadow:"0 1px 2px rgba(0,0,0,.08)"}}>
            {TABS.map(({key,label,color})=>(
              <button key={key} onClick={()=>{setTab(key);setSearch("");}}
                className="px-3 py-2 text-xs font-bold transition-colors"
                style={{
                  background: tab===key ? color : "transparent",
                  color: tab===key ? "white" : "var(--fb-secondary)",
                  borderRight: key!=="all" ? "1px solid var(--fb-border)" : "none",
                }}>
                {label} ({counts[key]})
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:"var(--fb-secondary)"}} />
            <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search jobs…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
              style={{background:"white",border:"1px solid var(--fb-border)",color:"var(--fb-text)"}}
              onFocus={(e)=>(e.currentTarget.style.borderColor="var(--fb-blue)")} onBlur={(e)=>(e.currentTarget.style.borderColor="var(--fb-border)")} />
          </div>

          <button onClick={()=>load(tab)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{background:"white",color:"var(--fb-secondary)",border:"1px solid var(--fb-border)"}}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Job list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{borderColor:"var(--fb-blue) transparent var(--fb-blue) var(--fb-blue)"}} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center" style={{border:"1px solid var(--fb-border)"}}>
            <Briefcase className="w-10 h-10 mx-auto mb-3" style={{color:"var(--fb-secondary)"}} />
            <p className="font-bold text-lg">No jobs found</p>
            <p className="text-sm mt-1" style={{color:"var(--fb-secondary)"}}>{tab==="pending"?"No posts waiting for review.":"Nothing here yet."}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((job)=>{
              const pt = getProjectType(job.projectType);
              const isOpen = open===job.id;
              return (
                <div key={job.id} className="bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-md" style={{border:"1px solid var(--fb-border)",boxShadow:"0 1px 2px rgba(0,0,0,.08)"}}>
                  <div className="flex items-start gap-3 p-4">
                    {job.imageUrl&&(
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                        <Image src={job.imageUrl} alt={job.jobTitle} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:pt.color+"18",color:pt.color}}>{pt.label}</span>
                        <StatusBadge status={job.status} />
                      </div>
                      <p className="font-bold text-sm truncate">{job.jobTitle}</p>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        <span className="flex items-center gap-1 text-xs" style={{color:"var(--fb-secondary)"}}><Building2 className="w-3 h-3"/>{job.companyName}</span>
                        <span className="flex items-center gap-1 text-xs" style={{color:"var(--fb-secondary)"}}><MapPin className="w-3 h-3"/>{job.location}</span>
                        <span className="text-xs font-medium" style={{color:"var(--fb-secondary)"}}>{job.currency} {job.salary}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[11px]" style={{color:"var(--fb-secondary)"}}>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3"/>{job.viewCount}</span>
                        {job._count&&<span className="flex items-center gap-1"><Users className="w-3 h-3"/>{job._count.applications} apps</span>}
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {(job.status==="pending"||job.status==="rejected")&&(
                        <ActionBtn onClick={()=>approve(job.id)} loading={busy===`${job.id}-ap`} title="Approve" color="#42B72A" bg="#E6F4EA">
                          <CheckCircle className="w-3.5 h-3.5"/>
                        </ActionBtn>
                      )}
                      {job.status==="pending"&&(
                        <ActionBtn onClick={()=>reject(job.id)} loading={busy===`${job.id}-rj`} title="Reject" color="#F44336" bg="#FFF0F0">
                          <XCircle className="w-3.5 h-3.5"/>
                        </ActionBtn>
                      )}
                      <ActionBtn onClick={()=>del(job.id)} loading={busy===`${job.id}-dl`} title="Delete" color="#F44336" bg="var(--fb-bg)">
                        <Trash2 className="w-3.5 h-3.5"/>
                      </ActionBtn>
                      <ActionBtn onClick={()=>setOpen(isOpen?null:job.id)} title="Details" color="var(--fb-blue)" bg="var(--fb-blue-light)">
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen?"rotate-180":""}`}/>
                      </ActionBtn>
                    </div>
                  </div>

                  {isOpen&&(
                    <div className="px-4 pb-3 pt-2 border-t" style={{borderColor:"var(--fb-border)",background:"var(--fb-bg)"}}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[{l:"Experience",v:job.experience},{l:"Qualification",v:job.qualification},{l:"Post Type",v:job.postType.replace(/_/g," ")},{l:"ID",v:job.id.slice(0,10)+"…"}].map(({l,v})=>(
                          <div key={l} className="bg-white rounded-xl p-2.5" style={{border:"1px solid var(--fb-border)"}}>
                            <p className="text-[10px] font-bold uppercase tracking-wide" style={{color:"var(--fb-secondary)"}}>{l}</p>
                            <p className="text-xs font-semibold mt-0.5 truncate">{v}</p>
                          </div>
                        ))}
                      </div>
                      {job.status==="approved"&&(
                        <Link href={`/job/${job.id}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold mt-2" style={{color:"var(--fb-blue)"}}>
                          View Live Post →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionBtn({children,onClick,loading,title,color,bg}:{children:React.ReactNode;onClick:()=>void;loading?:boolean;title:string;color:string;bg:string}) {
  return (
    <button onClick={onClick} title={title} disabled={loading}
      className="w-8 h-8 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-50"
      style={{background:bg,color,border:`1px solid ${color}30`}}>
      {loading ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"/> : children}
    </button>
  );
}

function StatusBadge({status}:{status:string}) {
  const m:{[k:string]:{bg:string;color:string;label:string}} = {
    pending: {bg:"#FFF9E6",color:"#986801",label:"Pending"},
    approved:{bg:"#E6F4EA",color:"#1E7E34",label:"Live"},
    rejected:{bg:"#FFF0F0",color:"#C62828",label:"Rejected"},
  };
  const c = m[status]??m.pending;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:c.bg,color:c.color}}>{c.label}</span>;
}
