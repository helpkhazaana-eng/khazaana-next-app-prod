import { getNotesPaginated } from '@/lib/notes-manager';
import NotesList from './NotesList';

export const metadata = {
  title: 'Notes | Admin Dashboard',
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function NotesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const { notes, total, totalPages } = await getNotesPaginated(page, 10);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Notes
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Track bugs, features, and general notes
          </p>
        </div>
        <div className="text-sm text-slate-500 font-medium">
          {total} total notes
        </div>
      </div>

      <NotesList 
        initialNotes={notes} 
        currentPage={page} 
        totalPages={totalPages} 
        total={total}
      />
    </div>
  );
}
